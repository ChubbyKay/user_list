(function () {
  const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
  const INDEX_URL = BASE_URL + "/api/v1/users/";
  const userData = [];
  const favoriteData = JSON.parse(localStorage.getItem("favoriteUser")) || [];
  const dataPanel = document.getElementById("data-panel");

  const searchForm = document.getElementById("search");
  const searchInput = document.getElementById("search-input");
  const searchSelect = document.getElementById("search-select");

  const genderFilter = document.getElementById("gender-filter");

  const favoriteCardListIcons = document.getElementById(
    "heart-card-list-icons"
  );
  const favoriteMode = 0;
  const cardMode = 1;
  const listMode = 2;

  const pagination = document.getElementById("pagination");
  const ITEM_PER_PAGE = 20;

  let presentMode = 1;
  let presentPage = 1;
  let paginationData = [];

  axios
    .get(INDEX_URL)
    .then((response) => {
      userData.push(...response.data.results);
      // console.log(data);
      // displayDataList(data);
      getTotalPages(userData);
      getPageData(presentPage, userData);
    })
    .catch((error) => console.log(error));

  // listen to button panel
  dataPanel.addEventListener("click", (event) => {
    if (event.target.matches(".card-avatar")) {
      showUser(event.target.dataset.id);
    } else if (event.target.matches(".btn-more-info")) {
      showUser(event.target.dataset.id);
    } else if (event.target.matches(".btn-add-favorite")) {
      addFavoriteItem(event.target.dataset.id);
      // console.log(event.target.dataset.id)
    } else if (event.target.matches("#addFavoriteButton")) {
      addFavoriteItem(event.target.dataset.id);
    } else if (event.target.matches(".btn-remove-favorite")) {
      removeFavoriteUser(event.target.dataset.id);
    }
  });

  // listen to search bar
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let input = searchInput.value.toLowerCase();
    let results = "";
    //排除搜尋關鍵字為空字串
    if (!input.length) {
      alert('請輸入關鍵字搜尋')
      return
    }
    //搜尋姓名/地區/年齡
    if (searchSelect.value === "1") {
      results = userData.filter(
        (user) =>
          user.name.toLowerCase().includes(input) ||
          user.surname.toLowerCase().includes(input)
      );
    } else if (searchSelect.value === "2") {
      results = userData.filter((user) =>
        user.region.toLowerCase().includes(input)
      );
    } else if (searchSelect.value === "3") {
      results = userData.filter(
        (user) => user.age === Number(searchInput.value)
      );
    }
    displayDataList(results);
    getTotalPages(results);
    getPageData(presentPage, results);
  });

  //listen to gender Filter
  genderFilter.addEventListener("click", (event) => {
    let genderResults = "";
    if (event.target.matches("#genderMale")) {
      genderResults = userData.filter((user) => user.gender === "male");
    } else if (event.target.matches("#genderFemale")) {
      genderResults = userData.filter((user) => user.gender === "female");
    } else {
      genderResults = userData;
    }
    displayDataList(genderResults);
    getTotalPages(genderResults);
    getPageData(presentPage, genderResults);
  });

  // listen to card/list/favorite mode click event
  favoriteCardListIcons.addEventListener("click", (event) => {
    if (event.target.matches(".fa-bars")) {
      presentMode = listMode;
      getPageData(presentPage);
    } else if (event.target.matches(".fa-th")) {
      presentMode = cardMode;
      getPageData(presentPage);
    } else if (event.target.matches("#favoriteMode")) {
      presentMode = favoriteMode;
      getPageData(presentPage);
    }
  });

  // listen to pagination click event
  pagination.addEventListener("click", (event) => {
    console.log(event.target.dataset.page);
    if (event.target.tagName === "A") {
      presentPage = event.target.dataset.page;
      getPageData(presentPage);
    }
  });

  //展示使用者資料
  function displayDataList(data) {
    let htmlContent = "";
    if (presentMode === cardMode) {
      data.forEach((item) => {
        htmlContent += `
        <div class="card" style="width: 10rem;">
          <img src="${item.avatar}" class="card-avatar" data-target="#show-user-modal" alt="Avatar" data-id="${item.id}" data-toggle="modal" width=100%>
          <div class="card-body">
            <p class="card-text">${item.name} ${item.surname}</p>
          </div>
              <!-- favorite button --> 
            <div class="card-footer">
              <i class="far fa-heart fa-lg" id = "addFavoriteButton" data-id="${item.id}"></i>
            </div>
        </div>`;
      });
      dataPanel.innerHTML = htmlContent;
    } else if (presentMode === listMode) {
      data.forEach((item) => {
        htmlContent += `<table class="table">
            <tbody>
              <tr>
                <td class="d-flex justify-content-between">
                  <span>
<img src="${item.avatar}" style="width: 5rem">  ${item.name} ${item.surname}
</span>
                  <div class="cardButton">
<!-- more button -->
                    <button class="btn btn-primary btn-more-info" data-toggle="modal" data-target="#show-user-modal" data-id="${item.id}">More</button>
                    <!-- favorite button -->
                    <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table> `;
      });
      dataPanel.innerHTML = htmlContent;
    } else if (presentMode === favoriteMode) {
      favoriteData.forEach((item) => {
        htmlContent += `
        <div class="card" style="width: 10rem;">
          <img src="${item.avatar}" class="card-avatar" data-target="#show-user-modal" alt="Avatar" data-id="${item.id}" data-toggle="modal" width=100%>
          <div class="card-body">
            <p class="card-text">${item.name} ${item.surname}</p>
          </div>
              <!-- More button --> 
          <div class="card-footer">
            <button class="btn btn-primary btn-email" data-id="${item.id}"><a href="mailto:${item.email}" style="text-decoration:none; color:white">E-mail</a></button>
              <!-- delete button --> 
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
          </div>
            </div>`;
      });
      dataPanel.innerHTML = htmlContent;
    }
  }

  //下方分頁函式
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1;
    let pageItemContent = "";
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${
        i + 1
        }</a>
        </li>
      `;
    }
    pagination.innerHTML = pageItemContent;
  }

  function getPageData(pageNum, data) {
    paginationData = data || paginationData;
    let offset = (pageNum - 1) * ITEM_PER_PAGE;
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE);
    displayDataList(pageData);
  }

  //set elements
  function showUser(id) {
    const modalTitle = document.getElementById("show-user-name");
    const modalImage = document.getElementById("show-user-avatar");
    const modalDate = document.getElementById("show-user-birthday");
    const modalEmail = document.getElementById("show-user-email");
    const modalAge = document.getElementById("show-user-age");
    const modalGender = document.getElementById("show-user-gender");
    const modalRegion = document.getElementById("show-user-region");

    // set request url
    const url = INDEX_URL + id;
    // console.log(url);

    // send request to show api
    axios
      .get(url)
      .then((response) => {
        const data = response.data;
        console.log(data);

        // insert data into modal ui
        modalTitle.textContent = `${data.name} ${data.surname}`;
        modalImage.innerHTML = `<img src="${data.avatar}" class="modal-card-avatar" alt="Avatar" width=100%>`;
        modalDate.textContent = `Birthday : ${data.birthday}`;
        modalAge.textContent = `Age: ${data.age}`;
        modalGender.textContent = `Gender: ${data.gender}`;
        modalRegion.textContent = `Region: ${data.region}`;
        modalEmail.textContent = `E-mail : ${data.email}`;
      })
      .catch((err) => console.log(err));
  }

  //添增選項至最愛清單
  function addFavoriteItem(id) {
    const user = userData.find((item) => item.id === Number(id));

    if (favoriteData.some((item) => item.id === Number(id))) {
      alert(`${user.name} 已經在你的交友清單`);
    } else {
      favoriteData.push(user);
      alert(`添增 ${user.name} 至你的交友清單`);
    }
    localStorage.setItem("favoriteUser", JSON.stringify(favoriteData));
  }

  function removeFavoriteUser(id) {
    //尋找User ID有無在清單中
    const index = favoriteData.findIndex((item) => item.id === Number(id));
    if (index === -1) return;
    //若在清單中，則移除該使用者
    favoriteData.splice(index, 1);
    localStorage.setItem("favoriteUser", JSON.stringify(favoriteData));
    //渲染displayDataList
    displayDataList(favoriteData);
  }
})();
