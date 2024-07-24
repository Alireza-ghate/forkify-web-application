// imports all exported values from model.js
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// parcel v1
// import icons from '../img/icons.svg';

// for pollyfilling everything
import 'core-js/stable';

// for pollyfilling only asynce await
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if (module.hot) {
  module.hot.accept();
}
// تمام توابع زیر همگی handler or callback function برای ایونت ها هستند
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    resultsView.update(model.getSearchResultPage());
    // 1) load recipe
    // چون چیزی return نمیده پس نیازی به ذخیره کردن آن در متغییر نداریم
    await model.loadRecipe(id);
    // 2) rendering recipe:
    recipeView.render(model.state.recipe);
    // 3) updating bookmarks

    bookmarksView.update(model.state.bookmarks);
    // اگر کل کلاس را export می کردیم
    // const recipeView =  new recipeView (model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    // based on inputed text(query) Search result should be load from API
    await model.loadSearchResults(query);

    // renders ALL search results as list item into dom
    // resultsView.render(model.state.search.results);

    // but if we want only the first 10 search results to be render
    resultsView.render(model.getSearchResultPage());
    // renders initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// when we click on prev or next btn 2 things must be happen:
const controlPagination = function (goToPage) {
  //1) based on goToPage number render the search results
  resultsView.render(model.getSearchResultPage(goToPage));
  // 2) render new prev and next btns
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update recipe servings(in state)
  model.updateServings(newServings);
  // update the entire recipe view again
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBoomark = function () {
  // 1) add /remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) update recipe view
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
  // 3) render the bookmarks
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddrecipe = async function (newRecipe) {
  try {
    // add spinner before upload any recipe
    addRecipeView.renderSpinner();
    // upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    // render recipe
    recipeView.render(model.state.recipe);

    // display seccuess message
    addRecipeView.renderMessage();

    // render bookmarks panel(view)
    bookmarksView.render(model.state.bookmarks);

    // change ID in url
    // CHANGES THE URL WITHOUT RELOADING THE PAGE
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close modal window after 2.5 sec
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBoomark);
  addRecipeView.addHandlerUpload(controlAddrecipe);
  console.log('welcome!');
};
init();
