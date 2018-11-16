const cacheBuster = Date.now();
const travisUrlBase = 'https://travis-ci.org/andrewseaman35/aseaman.svg';

const region = 'us-east-1';
AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:5e2e162d-5a4f-460f-9d56-ad29adfa7a02',
});

const s3 = new AWS.S3({region: 'us-east-1'});

s3.listObjectsV2({
    Bucket: 'aseaman-website-test',
}, function(err, data) {
    if (err) {
        const el = document.getElementById('branch-list');
        const error = document.createElement('div');
        error.innerHTML = 'Something happened :(';
        el.appendChild(error);
    } else {
        onSuccess(data);
    }
});

const getTravisIconForBranch = function(branch) {
    const travisUrl = `${travisUrlBase}?branch=${branch}&cache_buster=${cacheBuster}`;
    const img = document.createElement('img');
    img.src = travisUrl;

    return img;
};

const IGNORE_ROOT_PATHS = new Set(['index.html', 'js']);
const getPathsFromListContents = function(contents) {
    const paths = [];
    contents.forEach(obj => {
        const path = obj.Key.split('/')[0];
        if (!IGNORE_ROOT_PATHS.has(path)) {
            paths.push(path);
        }
    }) ;
    return paths;
};

const addLinksToElement = function(element, paths) {
    const ul = document.createElement('ul');
    paths.forEach(path => {
        const li = document.createElement('li');
        const item = document.createElement('a');
        const travisIcon = getTravisIconForBranch(path);
        item.href = `./${path}/index.html`;
        item.innerHTML = path;
        li.append(item);
        li.append(travisIcon);
        ul.append(li);
    });
    element.append(ul);
};

const onSuccess = function(data) {
    const paths = getPathsFromListContents(data.Contents);
    const el = document.getElementById('branch-list');
    addLinksToElement(el, paths);
};
