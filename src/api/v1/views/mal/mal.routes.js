import e from "express";
import { generateMALAuthUrl } from "../../utils/mal.js";

const router = e.Router();

router.get('/login', async (req, res) => {
  try {
    const authorizationUrl = generateMALAuthUrl();
    res.redirect(authorizationUrl);
  } catch(err) {
    console.error('Login page error', err);
    res.status(500).send('Internal server error');
  }
})

router.get('/callback', async (req, res) => {
  try {
    let { code, error } = req.query;
    if (error) {
      throw new Error('Error: ' + error);
    }
    console.log(code);
    // const response = await fetch(process.env.BASE_URL + '/api/v1/auth/mal', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ code })
    // })
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message || 'Failed to authenticate');
    res.redirect('/');
  } catch(err) {
    console.error('MyAnimeList login error:', err);
    throw err;
  }
})

export default router;