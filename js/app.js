let isDataLoaded = false;
window.onload = function () {
    startLiveSync();
};

function setPage(p) {
    page = p;
    render();
}