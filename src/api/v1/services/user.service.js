import prisma from "../utils/prisma.js";
import customError from "../utils/customError.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import { formattedAnimeList } from "./animeList.service.js";
import { getUserAnimeList } from "./mal.service.js";
import { getPlatforms } from "./platform.service.js";

export const getUserDetail = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new customError('User not found', 404);
    }
    return { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      isVerified: user.isVerifed, 
      role: user.role,
      ...(user.picture && { picture: user.picture }), 
    };
  } catch(err) {
    console.log('Error in the getUserDetail service');
    throw err;
  }
}

export const getAnimeList = async (userId, status) => {
  status = status ? status.split(',') : undefined;
  try {
    const animeList = await prisma.animeList.findMany({
      where: {
        userId, 
        ...(status && {
          status: { in: status }
        })
      }
    })

    // Convert startDate and finishDate to YYYY-MM-DD
    animeList.map((anime) => formattedAnimeList(anime))

    return { ...animeList }
  } catch(err) {
    console.log('Error in the getAnimeList service');
    throw err;
  }
}

export const importAnimeList = async (userId, type) => {
  try {
    let isLeft = true, limit = 100, offset = 0, animeList = [];
    while (isLeft) {
      let animeListFromMAL = await getUserAnimeList(userId, '', undefined, limit, offset, 'my_list_status')
      animeList.push(animeListFromMAL.data)
      if (!animeListFromMAL.paging?.next) {
        break;
      }
      offset += limit
    }

    return animeList
  } catch(err) {
    console.log('Error in the importAnimeList service');
    throw err;
  }
}

// export const importAnimeList = async (userId) => {
//   try {

//   } catch(err) {
//     console.log('Error in the importAnimeList service');
//     throw err;
//   }
// }

// console.log((await importAnimeList(21)));
// console.log(await getPlatforms())

// id: 4,
// userId: 21,
// animeId: 1,
// animePlatformId: null,
// startDate: 2025-04-12T17:00:00.000Z,
// finishDate: 2025-07-12T17:00:00.000Z,
// progress: 4,
// score: 8,
// episodesDifference: 0,
// status: 'on_hold',
// isSyncedWithMal: true,
// updatedAt: 2025-04-12T22:49:15.025Z

// my_list_status: {
//   status: 'completed',
//   score: 7,
//   num_episodes_watched: 13,
//   is_rewatching: false,
//   updated_at: '2024-07-17T00:13:20+00:00',
//   start_date: '2024-01-06',
//   finish_date: '2024-03-30'
// }