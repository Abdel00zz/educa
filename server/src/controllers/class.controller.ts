import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { ValidationError, NotFoundError, AuthorizationError } from '../middleware/error';

export const createClass = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { name, description } = req.body;
  const teacherId = req.user!.id;

  const classData = await prisma.class.create({
    data: {
      name,
      description,
      teacherId
    },
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  res.status(201).json(classData);
};

export const getClasses = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  let classes;
  if (userRole === 'STUDENT') {
    classes = await prisma.class.findMany({
      where: {
        enrollments: {
          some: {
            userId
          }
        }
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            chapters: true
          }
        }
      }
    });
  } else {
    classes = await prisma.class.findMany({
      where: userRole === 'TEACHER' ? { teacherId: userId } : undefined,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            chapters: true
          }
        }
      }
    });
  }

  res.json(classes);
};

export const getClass = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      chapters: {
        orderBy: {
          order: 'asc'
        }
      },
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  // Vérifier l'accès
  if (
    userRole === 'STUDENT' &&
    !classData.enrollments.some(e => e.user.id === userId)
  ) {
    throw new AuthorizationError('Not enrolled in this class');
  }

  if (
    userRole === 'TEACHER' &&
    classData.teacherId !== userId
  ) {
    throw new AuthorizationError('Not authorized to view this class');
  }

  res.json(classData);
};

export const updateClass = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user!.id;

  const classData = await prisma.class.findUnique({
    where: { id }
  });

  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  if (classData.teacherId !== userId) {
    throw new AuthorizationError('Not authorized to update this class');
  }

  const updatedClass = await prisma.class.update({
    where: { id },
    data: {
      name,
      description,
      updatedAt: new Date()
    },
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  res.json(updatedClass);
};

export const deleteClass = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const classData = await prisma.class.findUnique({
    where: { id }
  });

  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  if (classData.teacherId !== userId) {
    throw new AuthorizationError('Not authorized to delete this class');
  }

  await prisma.class.delete({
    where: { id }
  });

  res.status(204).send();
};

export const enrollStudent = async (req: Request, res: Response) => {
  const { id: classId } = req.params;
  const studentId = req.user!.id;

  const classData = await prisma.class.findUnique({
    where: { id: classId }
  });

  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: studentId,
      classId
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      class: true
    }
  });

  res.status(201).json(enrollment);
};

export const unenrollStudent = async (req: Request, res: Response) => {
  const { id: classId } = req.params;
  const studentId = req.user!.id;

  await prisma.enrollment.delete({
    where: {
      userId_classId: {
        userId: studentId,
        classId
      }
    }
  });

  res.status(204).send();
};
