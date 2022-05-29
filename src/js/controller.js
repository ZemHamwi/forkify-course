import "core-js/stable";
import { MODAL_CLOSE_SECONDS } from "./config.js";
import "regenerator-runtime/runtime";
import * as model from "./model.js";
import recipeViews from "./veiws/recipeViews.js";
import { async } from "regenerator-runtime/runtime";
import searchView from "./veiws/searchView.js";
import resultsView from "./veiws/resultsView.js";
import paginationView from "./veiws/paginationView.js";
import bookmarksView from "./veiws/bookmarksView.js";
import addRecipeView from "./veiws/addRecipeView.js";

// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeViews.renderSpinner();

    // Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());
    // Update the bookmarks too
    bookmarksView.update(model.state.bookmarks);

    // 1. loading the recipe
    await model.loadRecipe(id);

    // 2. rendering the recipe:
    recipeViews.render(model.state.recipe);
  } catch (err) {
    recipeViews.renderError();
    console.warn(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1. get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2. load search results
    await model.loadSearchResults(query);

    // 3. render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));

    // 4. render initail pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.warn(err);
  }
};

const controlPagination = function (goToPage) {
  // 3. render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4. render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings(in state)
  model.updateServings(newServings);

  // updating the recipe view (here we are just editing the same recipe view and not creating another one)
  // recipeViews.render(model.state.recipe);
  recipeViews.update(model.state.recipe);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddBookmark = function () {
  // 1. add / remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // 2. update recipeView
  recipeViews.update(model.state.recipe);

  // 3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // render recipe:
    recipeViews.render(model.state.recipe);

    // displaying a succsess message
    addRecipeView.renderMessage();

    // rendering a new bookmark
    bookmarksView.render(model.state.bookmarks);

    // changing the id in the url
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // closing the form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SECONDS * 1000);
  } catch (err) {
    console.warn(err);
    addRecipeView.renderError(err.message);
  }
  // upload the new recipe data
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeViews.addHandlerRender(controlRecipes);
  recipeViews.addHandlerUpdateServings(controlServings);
  recipeViews.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log(`initing!`);
};
init();
