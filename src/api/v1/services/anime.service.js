import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import { getAnimeDetails } from "../services/mal.service.js";
import dayjs from "dayjs";

// CRUD Database Anime

export const createAnime = async (malId, title, picture, releaseAt, episodeTotal, status) => {
  try {
    // Get data from MyAnimeList
    const animeFromMAL = await getAnimeDetails(undefined, malId, 'start_date,num_episodes,status');
    title = title || animeFromMAL.title || undefined;
    picture = picture || animeFromMAL.main_picture?.large || undefined;
    releaseAt = releaseAt || dayjs(animeFromMAL.start_date).add(7, 'hour') || undefined;
    episodeTotal = episodeTotal || animeFromMAL.num_episodes || undefined;
    status = status || animeFromMAL.status || undefined;

    const anime = await prisma.anime.create({
      data: {
        malId, title, picture,
        ...(releaseAt && { releaseAt: dayjs(releaseAt).toISOString() }),
        ...(episodeTotal && { episodeTotal }),
        ...(status && { status }),
      },
    })
    return { ...anime }
  } catch(err) {
    console.log('Error in the createAnime service', err);
    if (err.code === "P2002") {
      throw new customError("Anime already exists", 409);
    }
    throw err;
  }
}

export const getAnimeDetailById = async (animeId, malId) => {
  try {
    const anime = await prisma.anime.findUnique({
      where: {
        ...(animeId ? { id: animeId } : { malId })
      }, 
      include: {
        mainPlatform: true, platforms: true
      }
    })
    if (!anime) {
      throw new customError('Anime not found', 404);
    }
    return { ...anime }
  } catch(err) {
    console.log('Error in the getAnimeDetailById service', err);
    throw err;
  }
}

export const updateAnime = async (animeId, malId, title, picture, releaseAt, episodeTotal, status, platformId) => {
  try {
    const anime = await prisma.anime.update({
      where: {
        ...(animeId ? { id: animeId } : { malId })
      }, 
      data: {
        ...(title && { title }),
        ...(picture && { picture }),
        ...(releaseAt && { releaseAt: dayjs(releaseAt).toISOString() }),
        ...(episodeTotal && { episodeTotal }),
        ...(status && { status }),
        ...(platformId && { platformId }),
      }, include: {
        mainPlatform: true,
      }
    })
    return { ...anime }
  } catch(err) {
    console.log('Error in the updateAnime service', err);
    if (err.code === "P2025") {
      throw new customError("Anime not found", 404);
    } else if (err.code === "P2003") {
      throw new customError("Platform not found", 404);
    } else if (err.code === "P2002") {
      throw new customError("Platform already exists", 409);
    }
    throw err;
  }
}

export const deleteAnime = async (animeId, malId) => {
  try {
    const anime = await prisma.anime.delete({
      where: {
        ...(animeId ? { id: animeId } : { malId })
      }, 
      include: {
        mainPlatform: true, platforms: true
      }
    })
    return { ...anime }
  } catch(err) {
    console.log('Error in the deleteAnime service', err);
    if (err.code === "P2025") {
      throw new customError("Anime not found", 404);
    }
    throw err;
  }
}

export const getAllAnime = async (title, releaseAtStart, releaseAtEnd, episodeTotalMinimum, episodeTotalMaximum, status) => {
  try {
    status = status ? status.split(',') : [];
    const anime = await prisma.anime.findMany({
      where: {
        ...(title && {
          title: { contains: title, mode: 'insensitive' }
        }),
        ...(releaseAtStart || releaseAtEnd
          ? {
              releaseAt: {
                ...(releaseAtStart && { gte: dayjs(releaseAtStart).toISOString() }),
                ...(releaseAtEnd && { lte: dayjs(releaseAtEnd).toISOString() }),
              },
            }
          : {}
        ),
        ...(episodeTotalMinimum || episodeTotalMaximum
          ? {
              episodeTotal: {
                ...(episodeTotalMinimum && { gte: episodeTotalMinimum }),
                ...(episodeTotalMaximum && { lte: episodeTotalMaximum }),
              },
            }
          : {}
        ),
      }, 
      ...(status?.length > 0 && {
        status: { in: status }
      }),
      ...(status?.includes('hiatus') && { 
        isHiatus: true 
      }),
      include: {
        mainPlatform: true,
      }
    })

    if (!anime) {
      throw new customError('Anime not found', 404);
    }
    return { ...anime }
  } catch(err) {
    console.log('Error in the getAllAnime service', err);
    throw err;
  }
}

// CRUD User Anime List

export const createOrUpdateAnimeList = async (
  userId, animeId, platformId, episodesDifference, progress, score, startDate, finishDate, status, isSyncedWithMal
) => {
  try {
    let animeList;
    let statusCode = 200;
    try {
      animeList = await prisma.animeList.update({
        where: { 
          userId_animeId: { userId, animeId }
        },
        data: {
          ...(platformId && { platformId }),
          ...(episodesDifference && { episodesDifference }),
          ...(progress && { progress }),
          ...(score && { score }),
          ...(startDate && { startDate: dayjs(startDate).toISOString() }),
          ...(finishDate && { finishDate: dayjs(finishDate).toISOString() }),
          ...(status && { status }),
          ...(isSyncedWithMal && { isSyncedWithMal }),
        },
        include: {
          anime: true, platform: true
        }
      });
    } catch(err) {
      if (err.code === "P2025") {
        statusCode = 201;
        animeList = await prisma.animeList.create({
          data: {
            userId, animeId,
            ...(platformId && { platformId }),
            ...(episodesDifference && { episodesDifference }),
            ...(progress && { progress }),
            ...(score && { score }),
            ...(startDate && { startDate: dayjs(startDate).toISOString() }),
            ...(finishDate && { finishDate: dayjs(finishDate).toISOString() }),
            ...(status && { status }),
            ...(isSyncedWithMal && { isSyncedWithMal }),
          },
          include: {
            anime: true, platform: true
          }
        });
      } else {
        throw err;
      }
    }

    return { ...animeList, statusCode };
  } catch(err) {
    console.log('Error in the createOrUpdateAnimeList service', err);
    if (err.code === "P2003") {
      throw new customError("Platform not found", 404);
    }
    throw err;
  }
}

export const getAnimeListDetail = async (userId, animeId) => {
  try {
    const animeList = await prisma.animeList.findUnique({
      where: {
        userId_animeId: { userId, animeId } 
      },
      include: {
        anime: true, platform: true
      }
    })
    if (!animeList) {
      throw new customError('AnimeList not found', 404);
    }
    return { ...animeList }
  } catch(err) {
    console.log('Error in the getAnimeListDetail service', err);
    throw err;
  }
}

export const deleteAnimeList = async (userId, animeId) => {
  try {
    const animeList = await prisma.animeList.delete({
      where: { 
        userId_animeId: { userId, animeId } 
      },
      include: {
        anime: true, platform: true
      }
    })
    return { ...animeList }
  } catch(err) {
    if (err.code === "P2025") {
      throw new customError("AnimeList not found", 404);
    }
    console.log('Error in the deleteAnimeList service', err);
    throw err;
  }
}

export const getAllAnimeList = async (
  userId, episodesDifferenceMinimum, episodesDifferenceMaximum, status, isSyncedWithMal, 
  sortBy='alphabetical', sortOrder='asc'
) => {
  try {
    status = status ? status.split(',') : [];
    // sortBy = title,releaseAt,updatedAt,score,progress
    if (sortBy === 'title') {
      sortBy = { 
        anime: { title: sortOrder } 
      }
    } else if (sortBy === 'releaseAt') {
      sortBy = { 
        anime: { releaseAt: sortOrder } 
      }
    } else {
      sortBy = { [sortBy]: sortOrder }
    }

    const animeList = await prisma.animeList.findMany({
      where: {
        userId,
        ...(episodesDifferenceMinimum || episodesDifferenceMaximum
          ? {
              episodesDifference: {
                ...(episodesDifferenceMinimum && { gte: episodesDifferenceMinimum }),
                ...(episodesDifferenceMaximum && { lte: episodesDifferenceMaximum }),
              },
            }
          : {}
        ),
        ...(status?.length > 0 && {
          status: { in: status }
        }),
        ...(isSyncedWithMal && { isSyncedWithMal: JSON.parse(isSyncedWithMal) })
      },
      orderBy: sortBy,
      include: {
        anime: true, platform: true
      }
    })
    if (!animeList) {
      throw new customError('AnimeList not found', 404);
    }
    return { ...animeList }
  } catch(err) {
    console.log('Error in the getAllAnimeList service', err);
    throw err;
  }
}

// console.log((await createOrUpdateAnimeList(21, 1, 3, 0, 4, 8, dayjs(), undefined, 'watching')));
// console.log((await getAnimeListDetail(2)));
// console.log((await deleteAnimeList(2)));
