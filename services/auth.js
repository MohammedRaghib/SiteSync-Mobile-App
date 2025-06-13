export const login = async (username, password) => {
  try {
    var API_URL='https://sitesync.angelightrading.com/home/angeligh/sitesyncdjango'
    const response = await fetch(`${API_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    // Optionally save token to AsyncStorage
    return true;
  } catch (error) {
    console.error('Login error', error);
    return false;
  }
};
