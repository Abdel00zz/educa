import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { ValidationError, NotFoundError, AuthorizationError } from '../middleware/error';

export const createExercise = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { gradeLevel, lesson, statement, problems } = req.body;
  const createdBy = req.user!.id;

  const exercise = await prisma.exercise.create({
    data: {
      gradeLevel,
      lesson,
      statement,
      createdBy,
      problems: {
        create: problems.map((p: any) => ({
          number: p.number,
          text: p.text,
          subProblems: p.subProblems ? {
            create: p.subProblems.map((sp: any) => ({
              label: sp.label,
              text: sp.text
            }))
          } : undefined
        }))
      }
    },
    include: {
      problems: {
        include: {
          subProblems: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  res.status(201).json(exercise);
};

export const getExercises = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const exercises = await prisma.exercise.findMany({
    where: userRole === 'TEACHER' ? { createdBy: userId } : undefined,
    include: {
      _count: {
        select: {
          problems: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  res.json(exercises);
};

export const getExercise = async (req: Request, res: Response) => {
  const { id } = req.params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: {
      problems: {
        include: {
          subProblems: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!exercise) {
    throw new NotFoundError('Exercise not found');
  }

  res.json(exercise);
};

export const updateExercise = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { id } = req.params;
  const { gradeLevel, lesson, statement, problems } = req.body;
  const userId = req.user!.id;

  const exercise = await prisma.exercise.findUnique({
    where: { id }
  });

  if (!exercise) {
    throw new NotFoundError('Exercise not found');
  }

  if (exercise.createdBy !== userId) {
    throw new AuthorizationError('Not authorized to update this exercise');
  }

  // Utiliser une transaction pour mettre à jour l'exercice et ses problèmes
  const updatedExercise = await prisma.$transaction(async (tx) => {
    // Supprimer les problèmes et sous-problèmes existants
    if (problems) {
      await tx.subProblem.deleteMany({
        where: {
          problem: {
            exerciseId: id
          }
        }
      });
      await tx.problem.deleteMany({
        where: { exerciseId: id }
      });
    }

    // Mettre à jour l'exercice et créer les nouveaux problèmes
    return tx.exercise.update({
      where: { id },
      data: {
        gradeLevel,
        lesson,
        statement,
        updatedAt: new Date(),
        problems: problems ? {
          create: problems.map((p: any) => ({
            number: p.number,
            text: p.text,
            subProblems: p.subProblems ? {
              create: p.subProblems.map((sp: any) => ({
                label: sp.label,
                text: sp.text
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        problems: {
          include: {
            subProblems: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });
  });

  res.json(updatedExercise);
};

export const deleteExercise = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const exercise = await prisma.exercise.findUnique({
    where: { id }
  });

  if (!exercise) {
    throw new NotFoundError('Exercise not found');
  }

  if (exercise.createdBy !== userId) {
    throw new AuthorizationError('Not authorized to delete this exercise');
  }

  await prisma.exercise.delete({
    where: { id }
  });

  res.status(204).send();
};

interface ExerciseSolution {
  problemId: string;
  subProblemId?: string;
  solution: string;
}

export const submitSolution = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { id: exerciseId } = req.params;
  const { solutions } = req.body as { solutions: ExerciseSolution[] };
  const studentId = req.user!.id;

  // Vérifier que l'exercice existe
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      problems: {
        include: {
          subProblems: true
        }
      }
    }
  });

  if (!exercise) {
    throw new NotFoundError('Exercise not found');
  }

  // Vérifier que tous les problemId et subProblemId sont valides
  for (const solution of solutions) {
    const problem = exercise.problems.find(p => p.id === solution.problemId);
    if (!problem) {
      throw new ValidationError(`Problem ${solution.problemId} not found`);
    }

    if (solution.subProblemId) {
      const subProblem = problem.subProblems.find(sp => sp.id === solution.subProblemId);
      if (!subProblem) {
        throw new ValidationError(`SubProblem ${solution.subProblemId} not found`);
      }
    }
  }

  // Enregistrer les solutions
  const submission = await prisma.exerciseSubmission.create({
    data: {
      exerciseId,
      studentId,
      solutions: JSON.stringify(solutions)
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  res.status(201).json(submission);
};

export const getSolutions = async (req: Request, res: Response) => {
  const { id: exerciseId } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId }
  });

  if (!exercise) {
    throw new NotFoundError('Exercise not found');
  }

  const submissions = await prisma.exerciseSubmission.findMany({
    where: {
      exerciseId,
      ...(userRole === 'STUDENT' ? { studentId: userId } : {})
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Transformer les solutions de string JSON en objet
  const formattedSubmissions = submissions.map(s => ({
    ...s,
    solutions: JSON.parse(s.solutions as string)
  }));

  res.json(formattedSubmissions);
};
