import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import { getAnimeDetails, updateMyAnimeListStatus } from "../services/mal.service.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const formattedAnime = (anime) => {
  if (anime.releaseAt) {
    anime.releaseAt = dayjs.utc(anime.releaseAt).format('YYYY-MM-DD')
  }
  return anime;
}

// Basic CRUD Anime

export const createAnime = async (malId, picture, title, titleID, titleEN, releaseAt, episodeTotal, status) => {
  try {
    // Get data from MyAnimeList
    const animeFromMAL = await getAnimeDetails(undefined, malId, 'start_date,num_episodes,status,alternative_titles');
    picture = picture || animeFromMAL.main_picture?.large || undefined;
    title = title || animeFromMAL.title || undefined;
    titleEN = titleEN || animeFromMAL.alternative_titles.en || undefined;
    releaseAt = releaseAt || animeFromMAL.start_date ? dayjs.utc(animeFromMAL.start_date).format('YYYY-MM-DD') : undefined;
    episodeTotal = episodeTotal || animeFromMAL.num_episodes || undefined;
    status = status || animeFromMAL.status || undefined;

    const anime = await prisma.anime.create({
      data: {
        malId, picture, title,
        ...((titleID === null || titleID) && { titleID }),
        ...((titleEN === null || titleEN) && { titleEN }),
        ...(
          releaseAt === null ? { releaseAt: null } : 
          releaseAt ? { releaseAt: dayjs.utc(releaseAt) } : {}
        ),
        ...((episodeTotal === 0 || episodeTotal) && { episodeTotal }),
        ...(status && { status }),
      },
    })

    return { ...formattedAnime(anime) }
  } catch(err) {
    console.log('Error in the createAnime service');
    if (err.code === "P2002") {
      throw new customError("Anime already exists", 409);
    }
    throw err;
  }
}

export const getAnimeDetail = async (animeId, malId) => {
  try {
    const anime = await prisma.anime.findUnique({
      where: {
        ...(animeId ? { id: animeId } : { malId })
      }, 
      include: {
        platforms: true
      }
    })

    if (!anime) {
      throw new customError('Anime not found', 404);
    }

    return { ...formattedAnime(anime) }
  } catch(err) {
    console.log('Error in the getAnimeDetail service');
    throw err;
  }
}

export const updateAnime = async (animeId, malId, picture, title, titleID, titleEN, releaseAt, episodeTotal, status) => {
  try {
    const anime = await prisma.anime.update({
      where: {
        ...(animeId ? { id: animeId } : { malId })
      }, 
      data: {
        picture, title, titleID, titleEN, episodeTotal, status,
        ...(releaseAt === null ? { releaseAt: null } : { releaseAt: dayjs.utc(releaseAt) }),
      }, include: {
        platforms: true,
      }
    })
    return { ...formattedAnime(anime) }
  } catch(err) {
    console.log('Error in the updateAnime service');
    if (err.code === "P2025") {
      throw new customError("Anime not found", 404);
    }
    throw err;
  }
}

export const updateAnimeFields = async (
  animeId, malId, picture, title, titleID, titleEN, releaseAt, episodeTotal, status
) => {
  try {
    const anime = await prisma.anime.update({
      where: {
        ...(animeId ? { id: animeId } : { malId })
      }, 
      data: {
        ...(picture && { picture }),
        ...(title && { title }),
        ...((titleID === null || titleID) && { titleID }),
        ...((titleEN === null || titleEN) && { titleEN }),
        ...(
          releaseAt === null ? { releaseAt: null } : 
          releaseAt ? { releaseAt: dayjs.utc(releaseAt) } : {}
        ),
        ...((episodeTotal === 0 || episodeTotal) && { episodeTotal }),
        ...(status && { status }),
      }, include: {
        platforms: true,
      }
    })
    return { ...formattedAnime(anime) }
  } catch(err) {
    console.log('Error in the updateAnimeFields service');
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
        platforms: true
      }
    })
    return { ...formattedAnime(anime) }
  } catch(err) {
    console.log('Error in the deleteAnime service');
    if (err.code === "P2025") {
      throw new customError("Anime not found", 404);
    }
    throw err;
  }
}

// Anime Get

export const getAllAnime = async (
  title, releaseAtStart, releaseAtEnd, episodeTotalMinimum, episodeTotalMaximum, status,
  sortBy='title', sortOrder='asc'
) => {
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
      orderBy: {
        [sortBy]: sortOrder
      },
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

export const getAnimeTimeline = async (userId, weekCount=1, timeZone='Asia/Jakarta') => {
  try {
    const now = dayjs().toISOString();
    const localDate = dayjs(now).tz(timeZone);
    const startDate = localDate.subtract(3 * weekCount, 'day').startOf('day').toISOString();
    const endDate = localDate.add(3 * weekCount, 'day').endOf('day').toISOString();

    let anime = await prisma.anime.findMany({
      where: {
        platforms: {
          some: { OR : [
            { lastEpisodeAiredAt: { gte: startDate, lte: endDate } }, 
            { nextEpisodeAiringAt: { gte: startDate, lte: endDate } }
          ]},
        }
      },
      include: {
        mainPlatform: true, platforms: true, 
        ...(userId && {
          animeList: {
            where: { userId },
            include: { platform: true }
          }
        })
      },
    });

    // Filter main platform (between user selected platform and default platform)
    anime = anime.map((animes) => {
      let { mainPlatform, animeList, ...anime } = animes
      let platform;
      if (animeList[0]?.platform) { // If user anime list has platform
        platform = animeList[0].platform
      } else { // If not, use default main platform
        platform = mainPlatform
      }

      delete animeList[0]?.platform; // Delete because already moved to let platform

      return {
        ...anime,
        selectedPlatform: platform,
        myListStatus: animeList[0] || null,
      }
    });

    let timelineBeforeToday = anime
      .filter((value) => {
        const airedAt = value.selectedPlatform?.lastEpisodeAiredAt;
        return airedAt ? (dayjs(airedAt).isBefore(dayjs()) && dayjs(airedAt).isAfter(startDate)) : false;
      })
      .sort((a, b) => a.selectedPlatform.lastEpisodeAiredAt - b.selectedPlatform.lastEpisodeAiredAt)
      .map(value => {
        const episodesDifference = value.myListStatus?.episodesDifference || 0
        return { 
          schedule: {
            dateTime: value.selectedPlatform.lastEpisodeAiredAt,
            numEpisode: value.selectedPlatform.episodeAired + episodesDifference,
          },
          ...value 
        };
      })

    let timelineAfterToday = anime
      .filter((value) => {
        const airedAt = value.selectedPlatform?.nextEpisodeAiringAt;
        return airedAt ? (dayjs(airedAt).isAfter(dayjs()) && dayjs(airedAt).isBefore(endDate) ) : false;
      })
      .sort((a, b) => a.selectedPlatform.nextEpisodeAiringAt - b.selectedPlatform.nextEpisodeAiringAt)
      .map(value => {
        const episodesDifference = value.myListStatus?.episodesDifference || 0
        return { 
          schedule: {
            dateTime: value.selectedPlatform.nextEpisodeAiringAt,
            numEpisode: value.selectedPlatform.episodeAired + episodesDifference + 1,
          },
          ...value 
        };
      })

    // return { ...timelineBeforeToday, ...timelineAfterToday }
    const timeline = timelineBeforeToday.concat(timelineAfterToday)
    return { ...timeline }
  } catch(err) {
    console.log('Error in the getAnimeTimeline service', err);
    throw err;
  }
}

// export const getAllAnimeList = async (
//   userId, episodesDifferenceMinimum, episodesDifferenceMaximum, status, isSyncedWithMal, 
//   sortBy='alphabetical', sortOrder='asc'
// ) => {
//   try {
//     status = status ? status.split(',') : [];
//     // sortBy = title,releaseAt,updatedAt,score,progress
//     if (sortBy === 'title') {
//       sortBy = { 
//         anime: { title: sortOrder } 
//       }
//     } else if (sortBy === 'releaseAt') {
//       sortBy = { 
//         anime: { releaseAt: sortOrder } 
//       }
//     } else {
//       sortBy = { [sortBy]: sortOrder }
//     }

//     const animeList = await prisma.animeList.findMany({
//       where: {
//         userId,
//         ...(episodesDifferenceMinimum || episodesDifferenceMaximum
//           ? {
//               episodesDifference: {
//                 ...(episodesDifferenceMinimum && { gte: episodesDifferenceMinimum }),
//                 ...(episodesDifferenceMaximum && { lte: episodesDifferenceMaximum }),
//               },
//             }
//           : {}
//         ),
//         ...(status?.length > 0 && {
//           status: { in: status }
//         }),
//         ...(isSyncedWithMal && { isSyncedWithMal: JSON.parse(isSyncedWithMal) })
//       },
//       orderBy: sortBy,
//       include: {
//         anime: true, platform: true
//       }
//     })
//     if (!animeList) {
//       throw new customError('AnimeList not found', 404);
//     }
//     return { ...animeList }
//   } catch(err) {
//     console.log('Error in the getAllAnimeList service', err);
//     throw err;
//   }
// }
// console.log((await createOrUpdateAnimeList(21, 1, 3, 0, 4, 8, dayjs(), undefined, 'watching')));
// console.log((await getAnimeListDetail(2)));
// console.log((await deleteAnimeList(2)));
