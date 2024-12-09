import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { ValidationError, NotFoundError, AuthorizationError } from '../middleware/error';

const checkClassAccess = async (classId: string, userId: string, userRole: string) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      enrollments: {
        where: { userId }
      }
    }
  });

  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  if (
    userRole === 'STUDENT' &&
    classData.enrollments.length === 0
  ) {
    throw new AuthorizationError('Not enrolled in this class');
  }

  if (
    userRole === 'TEACHER' &&
    classData.teacherId !== userId
  ) {
    throw new AuthorizationError('Not authorized to access this class');
  }

  return classData;
};

export const createChapter = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { classId } = req.params;
  const { title, content, order } = req.body;
  const userId = req.user!.id;

  await checkClassAccess(classId, userId, req.user!.role);

  const chapter = await prisma.chapter.create({
    data: {
      title,
      content,
      order,
      classId
    }
  });

  res.status(201).json(chapter);
};

export const getChapters = async (req: Request, res: Response) => {
  const { classId } = req.params;
  const userId = req.user!.id;

  await checkClassAccess(classId, userId, req.user!.role);

  const chapters = await prisma.chapter.findMany({
    where: { classId },
    orderBy: { order: 'asc' }
  });

  res.json(chapters);
};

export const getChapter = async (req: Request, res: Response) => {
  const { classId, chapterId } = req.params;
  const userId = req.user!.id;

  await checkClassAccess(classId, userId, req.user!.role);

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      classId
    }
  });

  if (!chapter) {
    throw new NotFoundError('Chapter not found');
  }

  res.json(chapter);
};

export const updateChapter = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { classId, chapterId } = req.params;
  const { title, content, order } = req.body;
  const userId = req.user!.id;

  await checkClassAccess(classId, userId, req.user!.role);

  const chapter = await prisma.chapter.update({
    where: {
      id: chapterId,
      classId
    },
    data: {
      title,
      content,
      order,
      updatedAt: new Date()
    }
  });

  res.json(chapter);
};

export const deleteChapter = async (req: Request, res: Response) => {
  const { classId, chapterId } = req.params;
  const userId = req.user!.id;

  await checkClassAccess(classId, userId, req.user!.role);

  await prisma.chapter.delete({
    where: {
      id: chapterId,
      classId
    }
  });

  res.status(204).send();
};

export const reorderChapters = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { classId } = req.params;
  const { orders } = req.body;
  const userId = req.user!.id;

  await checkClassAccess(classId, userId, req.user!.role);

  // Utiliser une transaction pour s'assurer que tous les chapitres sont mis à jour
  await prisma.$transaction(
    orders.map((item: { id: string; order: number }) =>
      prisma.chapter.update({
        where: {
          id: item.id,
          classId
        },
        data: {
          order: item.order
        }
      })
    )
  );

  const updatedChapters = await prisma.chapter.findMany({
    where: { classId },
    orderBy: { order: 'asc' }
  });

  res.json(updatedChapters);
};
