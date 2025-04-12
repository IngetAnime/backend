import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import { getAnimeDetails } from "../services/mal.service.js";
import dayjs from "dayjs";

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

// export const deleteAnime = async

// console.log((await createAnime(60146)))
// console.log((await getAnimeDetailById(undefined, 60146)))
// console.log((await updateAnime(1, undefined, undefined, undefined, '2025-04-04T18:28:00.000Z', undefined, undefined, undefined)))
// console.log((await deleteAnime(4)));
// console.log((await getAllAnime(undefined, undefined, undefined, 1)));