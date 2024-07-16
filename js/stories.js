"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStars = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showStars ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getStarHTML(story, user){
  const isFavorite = user.isFavorite(story);
  const starred = isFavorite ? 'fas' : 'far';
  return `
    <span class="star">
      <i class="fa-star ${starred}"></i>
    </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function createNewStory(evt){
  evt.preventDefault();
  const author = $('#new-author').val();
  const title = $('#new-title').val();
  const url = $('#new-url').val();
  let newStory = {
    author, 
    title,
    url,
  }

  // console.log(newStory);
  const story = await storyList.addStory(currentUser, newStory); 
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");

}

$submitForm.on("submit", createNewStory);


// FAVORITES 

function putFavsListOnPage(){
  $favoriteStories.empty();

  if (currentUser.favorites.length === 0){
    $favoriteStories.append(`<h5>No fav's added yet! </h5>`);
  } else {
    for (let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
  }

  }

  $favoriteStories.show();
}


// toggle favorites 

async function toggleFavorites(evt) {
  const $target = $(evt.target);
  const $li = $target.closest('li');
  const storyId = $li.attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId); 
  
  //is fav'd 
  if ($target.hasClass('fas')){
    await currentUser.removeFavorite(story);
    $target.closest('i').toggleClass('fas far');
  } else {
    await currentUser.addFavorite(story);
    $target.closest('i').toggleClass('fas far');
  }
}

$storiesLists.on('click', '.star', toggleFavorites);

// USER STORIES 

function showUserStories(){
  $myStory.empty(); 

  if (currentUser.ownStories.length === 0){
    $mStory.append(`<h5>You've not added any stories yet! </h5>`);
  } else {
    for (let story of currentUser.ownStories){
      const $story = generateStoryMarkup(story, true);
      $myStory.append($story);
  }
  }

  $myStory.show();
}

// delete stories


function getDeleteBtnHTML(){
  return `
  <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
  </span>`;
}

async function deleteStory(evt){
  const $li = $(evt.target).closest('li');
  const storyId = $li.attr('id'); 

  await storyList.removeStory(currentUser, storyId);

  await showUserStories();
}

$myStory.on('click', '.trash-can', deleteStory);