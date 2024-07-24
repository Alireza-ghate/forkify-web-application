import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJASON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const creatRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    image: recipe.image_url,
    sourceUrl: recipe.source_url,
    ingredients: recipe.ingredients,
    cookingTime: recipe.cooking_time,
    servings: recipe.servings,
    // a TRICK when we gonna based on condition add a property to an object
    // all of objects doesnt have KEY if key exsist then add key to that object
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    // renaming the property names in recipe object using destructuring
    state.recipe = creatRecipeObject(data);
    // all the recipes that we get from API if this condition is true then add bookmarked set to true to all of them
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

// gets all data based on entered query
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        image: rec.image_url,
        title: rec.title,
        publisher: rec.publisher,
        ...(rec.key && { key: rec.key }),
      };
    });
    // reset the page to 1 after each new query search
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

// gets part of the result data
export const getSearchResultPage = function (page = state.search.page) {
  // update page
  state.search.page = page;
  // start = 0
  const start = (page - 1) * state.search.resultsPerPage;
  // end = 10 but in slice the last item dosnt count so it will 9
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(
    ing => (ing.quantity = (ing.quantity * newServings) / state.recipe.servings)
  );
  state.recipe.servings = newServings;
};
// saves recipe objects into local storage of browser
const presistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // add bookmark (to state)
  state.bookmarks.push(recipe);
  // Mark current recipe as bookmark
  // if id of recipe that we pass is === with id of recipe in our state(current recipe that loaded)
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  presistBookmark();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  presistBookmark();
};

// gets the recipe objects out of the local storage
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  // storage might be empty('') so it might be null:
  // if (!storage) return;
  // state.bookmarks = JSON.parse(storage);

  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// UPLOADS form's data to forkify API
export const uploadRecipe = async function (newRecipe) {
  // 1) format the newRecipe object that we get from the user to that object that we get from the API
  // ***whenever we need to creat an array using some exsisting data we should use MAP***
  // converting object to entries
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3) throw new Error(`wrong ingredient format!`);
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    // 2) creat the object that ready to upload into API
    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      image_url: newRecipe.image,
      source_url: newRecipe.sourceUrl,
      ingredients: newRecipe.ingredients,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // upload the data into server AND RETURN THAT DATA AGAIN!!!
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = creatRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
