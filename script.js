//! ==========================
//! Tailwind CSS Config Object
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        'genshin': ["SDK_JP_Web"],
        'udshingo': ["A-OTF UD Shin Go Pro"],
        'udshingont': ["A-OTF UD Shin Go NT Pro"],
        'notosansjp': ["Noto Sans JP"],
        'notosanssc': ["Noto Sans SC"],
      },
      backgroundImage: {
        'coverArt': "url('https://singlecolorimage.com/get/202020/960x960')"
      }
    },
  },
}
//! ==========================
//! VARIABLE CONST AREA
const Base64Var = {
  'pageTitle': 'SG9Zb3ZlcnNlIEp1a2Vib3g=',
  'main_trackNameField': 'SG9Zb3ZlcnNlIEp1a2Vib3g=',

};
const requiredBaseSettings = {
  'audioOriginUrl': 'https://raw.githubusercontent.com',
};
const settingsDefaultVar = {
  'settings_dataLang': 'en-us',
  'settings_quality': 2,
  'settings_db_uploader': 1,
  'settings_db_repository': 1,
  'settings_db_root': 1,
  'settings_db_category': 1
};
let initialAudioBool = false;
let settings_var = {
  'settings_dataLang': settingsDefaultVar.settings_dataLang,
  'settings_quality': settingsDefaultVar.settings_quality,
  'settings_db_uploader': settingsDefaultVar.settings_db_uploader,
  'settings_db_repository': settingsDefaultVar.settings_db_repository,
  'settings_db_root': settingsDefaultVar.settings_db_root,
  'settings_db_category': settingsDefaultVar.settings_db_category,
};
/* let database = {
  'albums': null,
  'availableTitleLanguages': null,
  'categories': null,
  'discs': null,
  'formats': null,
  'repositories': null,
  'roots': null,
  'tracks': null,
  'uploaders': null
} */
let database = {};
//! ==========================
//! DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  initialize();
  var audioPlayer = new Howl ({
    src: ['silence.m4a']
  });
  window.audioPlayer = audioPlayer;
});
//! ==========================

async function initialize () {
  await fetchJsonFiles();
  displayDeobfuscate();
  selectBoxBuild();
  document.getElementById('main_progressBar').value = 0;
}

function displayDeobfuscate () {
  document.title = atob(Base64Var.pageTitle);
  document.getElementById('main_trackNameField').textContent = atob(Base64Var.main_trackNameField);
}

function selectBoxBuild () {
  let settings_dataLang = document.getElementById('settings_dataLang');
  let settings_quality = document.getElementById('settings_quality');
  let settings_db_category = document.getElementById('settings_db_category');
  for (let i = 0; i < database.availableTitleLanguages.length; i++) {
    let temp_option = document.createElement('option');
    temp_option.value = database.availableTitleLanguages[i].name;
    temp_option.textContent = database.availableTitleLanguages[i].nameAlias;
    if (database.availableTitleLanguages[i].name === settingsDefaultVar.settings_dataLang) {
      temp_option.selected = true;
    }
    settings_dataLang.appendChild(temp_option);
  }
  for (let i = 0; i < database.qualitySettings.length; i++) {
    let temp_option = document.createElement('option');
    temp_option.value = database.qualitySettings[i].priority;
    temp_option.textContent = database.qualitySettings[i].nameDisp;
    if (database.qualitySettings[i].priority === settingsDefaultVar.settings_quality) {
      temp_option.selected = true;
    }
    settings_quality.appendChild(temp_option);
  }
  for (let i = 0; i < database.categories.length; i++) {
    let temp_option = document.createElement('option');
    temp_option.value = database.categories[i].uniqueId;
    temp_option.textContent = database.categories[i].nameDisp;
    if (database.categories[i].uniqueId === settingsDefaultVar.settings_db_category) {
      temp_option.selected = true;
    }
    settings_db_category.appendChild(temp_option);
  }
  document.getElementById('settings_dataLang').addEventListener('change', settingsOptionChanged);
  document.getElementById('settings_db_category').addEventListener('change', settingsOptionChanged);
  document.getElementById('settings_quality').addEventListener('change', settingsOptionChanged);
}

function settingsOptionChanged () {
  settings_var.settings_dataLang = document.getElementById('settings_dataLang').value;
  settings_var.settings_db_category = parseInt(document.getElementById('settings_db_category').value);
  settings_var.settings_quality = parseInt(document.getElementById('settings_quality').value);
}

async function fetchJsonFiles() {
  const urls = [
    'albums',
    'availableTitleLanguages',
    'categories',
    'discs',
    'formats',
    'qualitySettings',
    'repositories',
    'roots',
    'tracks',
    'uploaders'
  ];
  const responses = await Promise.all(urls.map(url => fetch(`db/json/${url}.json`)));
  const jsons = await Promise.all(responses.map(response => response.json()));
  const fileNames = urls;
  const databaseReturn = jsons.reduce((acc, json, index) => {
    acc[fileNames[index]] = json;
    return acc;
  }, {});
  database = databaseReturn;
}

function randomSelector(indexCount) {
  let randomizedIndex = Math.floor(Math.random() * indexCount);
  return randomizedIndex;
}

function changeInfoModalTab (tabId) {
  let aElement = document.getElementById("infoModal_tabParent").querySelectorAll('a');
  if (!document.getElementById(tabId).classList.contains('tab-active') && !document.getElementById(`${tabId}Content`).classList.contains('block')) {
    for (let i = 0; i < aElement.length; i++) {
      if (aElement[i].id !== tabId) {
        aElement[i].classList.remove('tab-active');
        document.getElementById(`${aElement[i].id}Content`).classList.remove('block');
        document.getElementById(`${aElement[i].id}Content`).classList.add('hidden');
      }
    }
    document.getElementById(tabId).classList.add('tab-active');
    document.getElementById(`${tabId}Content`).classList.remove('hidden');
    document.getElementById(`${tabId}Content`).classList.add('block');
  }
}

function returnUniqueIdFromTrackId (uniqueTrackId) {
  let specified_track = database.tracks.filter((item) => item.uniqueId === uniqueTrackId)[0];
  let specified_disc = database.discs.filter((item) => item.uniqueId === specified_track.discId)[0];
  let specified_album = database.albums.filter((item) => item.uniqueId === specified_disc.albumId)[0];
  let specified_category = database.categories.filter((item) => item.uniqueId === specified_album.categoryId)[0];
  let specified_root = database.roots.filter((item) => item.uniqueId === specified_category.rootId)[0];
  let specified_repository = database.repositories.filter((item) => item.uniqueId === specified_root.repositoryId)[0];
  let specified_uploader = database.uploaders.filter((item) => item.uniqueId === specified_repository.uploaderId)[0];
  return {
    'track': specified_track.uniqueId,
    'disc': specified_disc.uniqueId,
    'album': specified_album.uniqueId,
    'category': specified_category.uniqueId,
    'root': specified_root.uniqueId,
    'repository': specified_repository.uniqueId,
    'uploader': specified_uploader.uniqueId
  }
}

function audioURLBuilder (uniqueIdObject) {
  let temp_replacedFileUriName = encodeURIComponent(database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0]["trackName_en-us"].replace(/'/g, '_'));
  let temp_uploaderPath = database.uploaders.filter((item) => item.uniqueId === uniqueIdObject.uploader)[0].path;
  let temp_repositoryPath = database.repositories.filter((item) => item.uniqueId === uniqueIdObject.repository)[0].path;
  let temp_rootPath = database.roots.filter((item) => item.uniqueId === uniqueIdObject.root)[0].path;
  let temp_categoryPath = database.categories.filter((item) => item.uniqueId === uniqueIdObject.category)[0].path;
  let temp_albumPath = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].rootPath;
  let temp_specifiedFormatList = JSON.parse(database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].availableFormats);
  let temp_qualityBest_fid = temp_specifiedFormatList.slice(-1)[0];
  let temp_qualityNormal_fid = temp_specifiedFormatList.filter((item) => item <= 999).slice(-1)[0];
  let temp_qualityEfficient_fid = temp_specifiedFormatList[0];
  let temp_qualityBest_fileExtension = database.formats.filter((item) => item.uniqueId === temp_qualityBest_fid)[0].ext;
  let temp_qualityNormal_fileExtension = database.formats.filter((item) => item.uniqueId === temp_qualityNormal_fid)[0].ext;
  let temp_qualityEfficient_fileExtension = database.formats.filter((item) => item.uniqueId === temp_qualityEfficient_fid)[0].ext;
  let temp_qualityBest_qualityPath = database.formats.filter((item) => item.uniqueId === temp_qualityBest_fid)[0].path;
  let temp_qualityNormal_qualityPath = database.formats.filter((item) => item.uniqueId === temp_qualityNormal_fid)[0].path;
  let temp_qualityEfficient_qualityPath = database.formats.filter((item) => item.uniqueId === temp_qualityEfficient_fid)[0].path;
  let temp_calc_albumTrackTotal = database.tracks.filter((item) => item.albumId === uniqueIdObject.album).length;
  let temp_calc_relativeDiscCountCur = database.discs.filter((item) => item.uniqueId === uniqueIdObject.disc)[0].discNum;
  let temp_calc_previousDiscTrackTotal = 0;
  for (let i = 0; i < temp_calc_relativeDiscCountCur - 1; i++) {
    temp_calc_previousDiscTrackTotal += database.tracks.filter((item) => item.discId === (uniqueIdObject.disc - (temp_calc_relativeDiscCountCur - 1) + i)).length
  }
  let temp_calc_confirmedTrackNum = temp_calc_previousDiscTrackTotal + database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0].trackNum;
  let temp_calc_confirmedTrackNum_str = '';
  if (temp_calc_albumTrackTotal >= 100) {
    temp_calc_confirmedTrackNum_str = temp_calc_confirmedTrackNum.toString().padStart(3, '0');
  } else if (temp_calc_albumTrackTotal < 100) {
    temp_calc_confirmedTrackNum_str = temp_calc_confirmedTrackNum.toString().padStart(2, '0');
  }
  return {
    '1': `${requiredBaseSettings.audioOriginUrl}/${temp_uploaderPath}/${temp_repositoryPath}/main/${temp_rootPath}/${temp_categoryPath}/${temp_albumPath}/${temp_qualityBest_qualityPath}/${temp_calc_confirmedTrackNum_str}_${temp_replacedFileUriName}.${temp_qualityBest_fileExtension}`,
    '2': `${requiredBaseSettings.audioOriginUrl}/${temp_uploaderPath}/${temp_repositoryPath}/main/${temp_rootPath}/${temp_categoryPath}/${temp_albumPath}/${temp_qualityNormal_qualityPath}/${temp_calc_confirmedTrackNum_str}_${temp_replacedFileUriName}.${temp_qualityNormal_fileExtension}`,
    '3': `${requiredBaseSettings.audioOriginUrl}/${temp_uploaderPath}/${temp_repositoryPath}/main/${temp_rootPath}/${temp_categoryPath}/${temp_albumPath}/${temp_qualityEfficient_qualityPath}/${temp_calc_confirmedTrackNum_str}_${temp_replacedFileUriName}.${temp_qualityEfficient_fileExtension}`,
  }
}

function skipButtonPressed () {
  document.getElementById('main_progressBar').removeAttribute('value');
  if (initialAudioBool) {
    window.audioPlayer.unload();
  } else {
    initialAudioBool = true;
  };
  let filtered_albums_uniqueIdArray = database.albums.filter((item) => item.categoryId === settings_var.settings_db_category).map((item) => item.uniqueId);
  let filtered_tracks_uniqueIdArray = new Array();
  for (let i = 0; i < filtered_albums_uniqueIdArray.length; i++) {
    let temp_filtered_tracks_uniqueIdArray_perDisc = database.tracks.filter((item) => item.albumId === filtered_albums_uniqueIdArray[i]).map((item) => item.uniqueId);
    for (let j = 0; j < temp_filtered_tracks_uniqueIdArray_perDisc.length; j++) {
      filtered_tracks_uniqueIdArray.push(temp_filtered_tracks_uniqueIdArray_perDisc[j]);
    }
  }
  let randomSelectorOutput = randomSelector(filtered_tracks_uniqueIdArray.length);
  audioURLBuilder(returnUniqueIdFromTrackId(filtered_tracks_uniqueIdArray[randomSelectorOutput]));
  let confirmedAudioUrl = audioURLBuilder(returnUniqueIdFromTrackId(filtered_tracks_uniqueIdArray[randomSelectorOutput]))[settings_var.settings_quality];
  rewriteMetadataLabels(returnUniqueIdFromTrackId(filtered_tracks_uniqueIdArray[randomSelectorOutput]));
  var audioPlayer = new Howl ({
    src: [confirmedAudioUrl],
    html5: true
  });
  window.audioPlayer = audioPlayer;
  audioPlayer.on('loaderror', function(){
    console.error('Audio "loaderror" has occured. Retrying ...');
  });
  audioPlayer.on('playerror', function(){
    console.error('Audio "playerror" has occured. Retrying ...');
  });
  audioPlayer.on('load', function(){
    audioPlayer.play();
    document.getElementById('main_progressBar').setAttribute('value', 100);
  });
}

function rewriteMetadataLabels (uniqueIdObject) {
  if (database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0][`trackName_${settings_var.settings_dataLang}`] === null) {
    document.getElementById('main_trackNameField').textContent = database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0]['trackName_en-us'];
  } else {
    document.getElementById('main_trackNameField').textContent = database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0][`trackName_${settings_var.settings_dataLang}`];
  }
  document.getElementById('infoModal_fileTabContent_field_trackName_en-us').textContent = database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0]['trackName_en-us'];
  if (database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0]['trackName_ja-jp'] === null) {
    document.getElementById('infoModal_fileTabContent_field_trackName_ja-jp').textContent = 'null';
  } else {
    document.getElementById('infoModal_fileTabContent_field_trackName_ja-jp').textContent = database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0]['trackName_ja-jp'];
  }
  if (database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0]['trackName_zh-cn'] === null) {
    document.getElementById('infoModal_fileTabContent_field_trackName_zh-cn').textContent = 'null';
  } else {
    document.getElementById('infoModal_fileTabContent_field_trackName_zh-cn').textContent = database.tracks.filter((item) => item.uniqueId === uniqueIdObject.track)[0]['trackName_zh-cn'];
  }
  if (database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0][`albumTitle_${settings_var.settings_dataLang}`] === null) {
    document.getElementById('main_albumTitleField').textContent = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0]['albumTitle_en-us'];
  } else {
    document.getElementById('main_albumTitleField').textContent = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0][`albumTitle_${settings_var.settings_dataLang}`];
  }
  document.getElementById('infoModal_fileTabContent_field_albumTitle_en-us').textContent = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0]['albumTitle_en-us'];
  if (database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0]['albumTitle_ja-jp'] === null) {
    document.getElementById('infoModal_fileTabContent_field_albumTitle_ja-jp').textContent = 'null';
  } else {
    document.getElementById('infoModal_fileTabContent_field_albumTitle_ja-jp').textContent = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0]['albumTitle_ja-jp'];
  }
  if (database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0]['albumTitle_zh-cn'] === null) {
    document.getElementById('infoModal_fileTabContent_field_albumTitle_zh-cn').textContent = 'null';
  } else {
    document.getElementById('infoModal_fileTabContent_field_albumTitle_zh-cn').textContent = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0]['albumTitle_zh-cn'];
  }
  document.getElementById('main_albumArtistField').textContent = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].albumArtist;
  document.getElementById('infoModal_fileTabContent_field_albumArtist').textContent = database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].albumArtist;
  document.getElementById('infoModal_fileTabContent_field_link_vgmdb').setAttribute('href', database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].extLink_vgmdb);
  document.getElementById('infoModal_fileTabContent_field_link_musicbrainz').setAttribute('href', database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].extLink_musicbrainz);
  document.getElementById('infoModal_fileTabContent_field_link_applemusic').setAttribute('href', database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].extLink_applemusic);
  document.getElementById('infoModal_fileTabContent_field_link_spotify').setAttribute('href', database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].extLink_spotify);
  let coverArtUrl = `${requiredBaseSettings.audioOriginUrl}/${database.uploaders.filter((item) => item.uniqueId === uniqueIdObject.uploader)[0].path}/${database.repositories.filter((item) => item.uniqueId === uniqueIdObject.repository)[0].path}/main/${database.roots.filter((item) => item.uniqueId === uniqueIdObject.root)[0].path}/${database.categories.filter((item) => item.uniqueId === uniqueIdObject.category)[0].path}/${database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].rootPath}/cover.webp`;
  tailwind.config.theme.extend.backgroundImage.coverArt = `url('${coverArtUrl}')`;
  let temp_specifiedFormatList = JSON.parse(database.albums.filter((item) => item.uniqueId === uniqueIdObject.album)[0].availableFormats);
  let temp_qualityFidArray = [temp_specifiedFormatList.slice(-1)[0], temp_specifiedFormatList.filter((item) => item <= 999).slice(-1)[0], temp_specifiedFormatList[0]]
  document.getElementById('infoModal_audioTabContent_field_format').textContent = database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].nameDisp;
  document.getElementById('infoModal_audioTabContent_field_mime').textContent = database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].mime;
  document.getElementById('infoModal_audioTabContent_field_cid').textContent = database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].cid;
  switch (database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].isLossless) {
    case 1:
      document.getElementById('infoModal_audioTabContent_field_lossless').textContent = 'true';
    case 0:
      document.getElementById('infoModal_audioTabContent_field_lossless').textContent = 'false';
  }
  if (database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].bit === null) {
    document.getElementById('infoModal_audioTabContent_field_bitDepth').textContent = 'null';
    document.getElementById('infoModal_audioTabContent_bitDepthUnit').textContent = '';
  } else {
    document.getElementById('infoModal_audioTabContent_field_bitDepth').textContent = database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].bit;
    document.getElementById('infoModal_audioTabContent_bitDepthUnit').textContent = '-bit';
  }
  document.getElementById('infoModal_audioTabContent_field_sampleRate').textContent = database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].rate;
  document.getElementById('infoModal_audioTabContent_field_chCount').textContent = database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].ch;
  document.getElementById('infoModal_audioTabContent_field_bitRate').textContent = ceilDecimal(database.formats.filter((item) => item.uniqueId === temp_qualityFidArray[settings_var.settings_quality - 1])[0].bps / 1000, 1);
  
}

function floorDecimal (value, n) {
  return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n);
};
function ceilDecimal (value, n) {
  return Math.ceil(value * Math.pow(10, n)) / Math.pow(10, n);
};
function roundDecimal (value, n) {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
};
function formatFileSize (bytes, decimals = 2) {
  if (bytes === 0) return '0 byte';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
