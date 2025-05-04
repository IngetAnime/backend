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

    return formattedAnime(anime)
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

    return formattedAnime(anime)
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
    return formattedAnime(anime)
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
    return formattedAnime(anime)
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
    return formattedAnime(anime)
  } catch(err) {
    console.log('Error in the deleteAnime service');
    if (err.code === "P2025") {
      throw new customError("Anime not found", 404);
    }
    throw err;
  }
}

// Anime Get


// Platform Get

export const insertAnimePlatform = async (userId, listAnimeFromMAL) => {
  try {
    // Add anime if not already in database
    await prisma.anime.createMany({
      data: listAnimeFromMAL.map((anime) => {
        return {
          malId: anime.node.id,
          picture: anime.node.main_picture.large, 
          title: anime.node.title, 
          titleEN: anime.node.alternative_titles?.en || null, 
          releaseAt: anime.node.start_date ? dayjs.utc(anime.node.start_date) : null, 
          episodeTotal: anime.node.num_episodes || 0, 
          status: anime.node.status || 'not_yet_aired'
        }
      }),
      skipDuplicates: true,
    })

    // Re-map all malId from query MAL
    const allMalId = listAnimeFromMAL.map(anime => anime.node.id);
    // Get anime information from database
    let listAnimeFromDatabase = await prisma.anime.findMany({
      where: {
        malId: { in: allMalId }
      },
      include: {
        platforms: true,
        ...(userId && {
          animeList: {
            where: { userId }
          }
        })
      }
    });

    // Create indexing map based on malId
    const animeMap = new Map(
      listAnimeFromDatabase.map((anime) => [anime.malId, anime])
    );
    // Merge animeFromDatabase and animeFromMAL
    const listAnimeMerge =  listAnimeFromMAL.map((anime) => {
      let databaseAnime = animeMap.get(anime.node.id);
      if (databaseAnime.animeList.length) {
        databaseAnime.myListStatus = databaseAnime.animeList[0]
      } else {
        databaseAnime.myListStatus = {}
      }
      delete databaseAnime.animeList;
      delete anime.node.id, anime.node.title;
      return {
        ...formattedAnime(databaseAnime),
        ...anime.node,
      }
    })

    return { ...listAnimeMerge };
  } catch(err) {
    console.log('Error in the inserAnimePlatform service');
    throw err;
  }
}

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

// const listAnimeFromMAL = [
//   {
//     "node": {
//         "id": 59360,
//         "title": "Rock wa Lady no Tashinami deshite",
//         "main_picture": {
//             "medium": "https://cdn.myanimelist.net/images/anime/1169/148459.webp",
//             "large": "https://cdn.myanimelist.net/images/anime/1169/148459l.webp"
//         },
//         "alternative_titles": {
//             "synonyms": [],
//             "en": "Rock Is a Lady's Modesty",
//             "ja": "ロックは淑女の嗜みでして"
//         },
//         "start_date": "2025-04-03",
//         "num_episodes": 0,
//         "status": "currently_airing",
//         "synopsis": "At an elite all-girls' academy where refined young ladies gather, Lilisa Suzunomiya, now the daughter of a real estate tycoon after her mother remarried, is forced to abandon her guitar and rock music to fit in. However, her passion is reignited by sounds from the old school building, where she meets a skilled drummer who shares her love for rock. Together, they embrace their inner rockstars, elegantly clashing and shouting their way through the academy in this captivating tale of grace and rebellion.\n\n(Source: MAL News)"
//     }
//   },
//   {
//     "node": {
//         "id": 59369,
//         "title": "Lycoris Recoil: Friends Are Thieves of Time.",
//         "main_picture": {
//             "medium": "https://cdn.myanimelist.net/images/anime/1314/147593.jpg",
//             "large": "https://cdn.myanimelist.net/images/anime/1314/147593l.jpg"
//         },
//         "alternative_titles": {
//             "synonyms": [],
//             "en": "Lycoris Recoil: Friends are thieves of time.",
//             "ja": "『リコリス・リコイル』Friends are thieves of time."
//         },
//         "start_date": "2025-04-16",
//         "num_episodes": 6,
//         "status": "currently_airing",
//         "synopsis": "Six short movies featuring the daily lives of Chisato, Takina, and their friends. Each movie will have a different director and storyboard."
//     }
//   },
//   {
//     "node": {
//         "id": 59160,
//         "title": "Wind Breaker Season 2",
//         "main_picture": {
//             "medium": "https://cdn.myanimelist.net/images/anime/1526/148873.jpg",
//             "large": "https://cdn.myanimelist.net/images/anime/1526/148873l.jpg"
//         },
//         "alternative_titles": {
//             "synonyms": [
//                 "Winbre",
//                 "WBK"
//             ],
//             "en": "Wind Breaker Season 2",
//             "ja": "WIND BREAKER Season 2"
//         },
//         "start_date": "2025-04-04",
//         "num_episodes": 12,
//         "status": "currently_airing",
//         "synopsis": "Second season of Wind Breaker."
//     }
//   },
//   {
//     "node": {
//         "id": 59819,
//         "title": "Bye Bye, Earth 2nd Season",
//         "main_picture": {
//             "medium": "https://cdn.myanimelist.net/images/anime/1538/147930.jpg",
//             "large": "https://cdn.myanimelist.net/images/anime/1538/147930l.jpg"
//         },
//         "alternative_titles": {
//             "synonyms": [],
//             "en": "Bye Bye, Earth Season 2",
//             "ja": "ばいばい、アース 第2シーズン"
//         },
//         "start_date": "2025-04-04",
//         "num_episodes": 0,
//         "status": "currently_airing",
//         "synopsis": "Second season of Bye Bye, Earth."
//     }
//   },
//   {
//     "node": {
//         "id": 49778,
//         "title": "Kijin Gentoushou",
//         "main_picture": {
//             "medium": "https://cdn.myanimelist.net/images/anime/1722/148906.jpg",
//             "large": "https://cdn.myanimelist.net/images/anime/1722/148906l.jpg"
//         },
//         "alternative_titles": {
//             "synonyms": [
//                 "Sword of the Demon Hunter"
//             ],
//             "en": "Sword of the Demon Hunter: Kijin Gentosho",
//             "ja": "鬼人幻燈抄"
//         },
//         "start_date": "2025-03-31",
//         "num_episodes": 0,
//         "status": "currently_airing",
//         "synopsis": "After Jinta and Suzune ran away from their home as children, they were taken in by Motoharu—the virtuous sentinel of Kadono Village—and his daughter, Shirayuki. The settlement was ruled by its shrine maiden, Itsukihime, whom only a select few were allowed to interact with. When Itsukihime passed away, Shirayuki was appointed in her place. Wishing to stay in contact with her, Jinta worked diligently for years and was finally selected as the next sentinel.\n\nAs the protector of the village, Jinta's duty is to eliminate any threats. One day, he encounters a demon in a nearby forest. At the end of the battle, the demon makes a proclamation about the destined ruler of all demonkind. He attaches his severed arm to Jinta, turning him into an unaging demon man. By the time Jinta comes to, Kadono is on fire. Suzune has transformed into the demon from the divination, and due to a series of misunderstandings, she murders Shirayuk and flees.\n\nDevastated, Jinta cannot forgive Suzune for her actions; he departs on a journey to find her. As Jinta travels around Japan across the eras, he endeavors to protect as many people as possible from aggressive demons. In his quiet moments, he contemplates what he should do when he once again faces his childhood friend.\n\n[Written by MAL Rewrite]"
//     }
//   },
//   {
//     "node": {
//         "id": 60146,
//         "title": "Saikyou no Ousama, Nidome no Jinsei wa Nani wo Suru?",
//         "main_picture": {
//             "medium": "https://cdn.myanimelist.net/images/anime/1712/148299.webp",
//             "large": "https://cdn.myanimelist.net/images/anime/1712/148299l.webp"
//         },
//         "start_date": "2025-04-02",
//         "num_episodes": 0,
//         "my_list_status": {
//             "status": "watching",
//             "score": 0,
//             "num_episodes_watched": 4,
//             "is_rewatching": false,
//             "updated_at": "2025-04-30T23:46:03+00:00",
//             "start_date": "2025-04-03"
//         },
//         "alternative_titles": {
//             "synonyms": [
//                 "TBATE"
//             ],
//             "en": "The Beginning After the End",
//             "ja": "最強の王様、二度目の人生は何をする?"
//         },
//         "status": "currently_airing"
//     }
//   },
// ]

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
