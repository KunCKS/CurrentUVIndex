//-----------------指定元素-----------------
let dataItems = document.querySelector('#dataList')
let inputState = document.querySelector('#inputState')
let zoneTitle = document.querySelector('#zoneTitle')
let popular = document.querySelector('#popularList')
let pageNav = document.querySelector('#pageNav')
let scrollBtn = document.querySelector('#scrollToTop')
let favoriteBtn = document.querySelectorAll('.favorite')
let loading = document.querySelector('#loading')
let favoriteList = JSON.parse(localStorage.getItem('favoriteList')) || []
let UVIData = []
let dataLen = 0
let pageDataShow = 10 //預設每頁顯示的資料數
let content = [] //建立陣列乘載當前頁面內容資料（每次渲染時）
//↑建立變數用來儲存 for 迴圈輸出的元素（因為 innerHTML 會先清除元素內原本的東西再渲染，因此要利用 for 迴圈儲存資料再渲染，而不是用 for 迴圈去輸出渲染）
let pageRecord = 0 //儲存頁碼位置
let zoneData = []
//-----------------指定元素 END-----------------
let xhr = new XMLHttpRequest()
xhr.open(
  'GET',
  'https://opendata.epa.gov.tw/api/v1/UV?%24skip=0&%24top=1000&%24format=json',
  true
)
xhr.send(null)
xhr.onload = function() {
  UVIData = JSON.parse(xhr.responseText) //存放 api 給的資料，並轉換為 JSON 格式
  UVIData.map(item => {
    item.UVI = Math.floor(item.UVI) // 將數值修整為整數
    return item
  })
  dataLen = UVIData.length
  // content = [] //建立陣列乘載當前頁面內容資料（每次渲染時），注意這邊content資料是在xhr.onload內，不是全域
  //↑建立變數用來儲存 for 迴圈輸出的元素（因為 innerHTML 會先清除元素內原本的東西再渲染，因此要利用 for 迴圈儲存資料再渲染，而不是用 for 迴圈去輸出渲染）
  // pageRecord = 0 //儲存頁碼位置
  let counter = {} //計算陣列中「區域名稱」出現次數
  for (i = 0; i < dataLen; i++) {
    let zone = UVIData[i].County
    counter[zone] = counter[zone] ? counter[zone] + 1 : 1
    //想利用if做出一樣的功能但有問題，不知道怎麼解決
    // if (counter[zone] == counter[zone]) {
    //   counter[zone] = counter[zone] + 1;
    // } else {
    //   counter[zone] = 1;
    // }
  }
  console.log(counter)
  zoneData = Object.keys(counter) //列出目前有的zone
  console.log(zoneData)
  init()
  loading.setAttribute('class', 'loading d-none')
}
//-----------------監聽元素-----------------
popular.addEventListener('click', function(e) {
  //由於queryselector直接指定btn時，只會抓第1筆資料
  //所以改抓btn上層父元素，再設定條件阻止非btn的元素執行function
  if (e.target.nodeName !== 'BUTTON') {
    return
  }
  updatePage(e.target.innerText)
  // 以下語法在點選熱門區域時會依照內容來對input option做selected
  for (let i = 0; i < inputState.children.length; i++) {
    if (inputState.children[i].hasAttribute('selected')) {
      inputState.children[i].removeAttribute('selected')
    }
    if (inputState.children[i].value === e.target.innerText) {
      inputState.children[i].setAttribute('selected', true)
    }
  }
  // console.log(inputState.children)
})
inputState.addEventListener(
  'change',
  function(e) {
    if (e.target.value === '全部地區') {
      init()
    } else {
      //抓取監聽 change 所產生的event中， target 指向的 value
      updatePage(e.target.value)
    }
  },
  false
)
pageNav.addEventListener('click', function(e) {
  if (e.target.nodeName !== 'A') {
    return
  }
  e.preventDefault()
  paginationShow(e.target.innerText)
})
scrollBtn.addEventListener('click', function(e) {
  e.preventDefault()
  scrollToTop()
})
//-----------------監聽元素 END-----------------
//-----------------初始化-----------------
// init()
function init() {
  zoneTitle.textContent = '全部地區'
  content = []
  // console.log(UVIData)
  for (let i = 0; i < dataLen; i++) {
    let favoriteIcon = 'far' // 預設輸出為空心的icon
    favoriteList.forEach(item => {
      if (item.SiteName === UVIData[i].SiteName) {
        favoriteIcon = 'fas'
      }
    })
    // 建立元素輸出的模板
    // 依據數值大小加入不同的ClassName
    let UVstatus
    let textColor
    if (UVIData[i].UVI < 3) {
      UVstatus = 'success'
      textColor = 'muted'
    } else if (UVIData[i].UVI >= 3 && UVIData[i].UVI <= 5) {
      UVstatus = 'warning'
      textColor = 'white'
    } else if (UVIData[i].UVI >= 6 && UVIData[i].UVI <= 7) {
      UVstatus = 'orange'
      textColor = 'white'
    } else if (UVIData[i].UVI >= 8 && UVIData[i].UVI <= 10) {
      UVstatus = 'danger'
      textColor = 'white'
    } else {
      UVstatus = 'purple'
      textColor = 'white'
    }
    let items = `
      <div class="col-6">
            <div class="card mb-3">
              <div
                class="d-flex text-${textColor} py-6 justify-content-around align-items-end bg-${UVstatus} position-relative"
              >
                <a href="#" class="favorite btn text-danger">
                  <i class="${favoriteIcon} fa-heart "></i>
                </a>
                <h3 class="display-4 mb-0 ">${UVIData[i].SiteName}</h3>
                <span class="">紫外線指數</span
                ><span class="display-4 ">${UVIData[i].UVI}</span>
              </div>
              <div class="card-body">
                <p class="card-text">
                  <i class="fas fa-map-marker-alt mr-2 text-orange"></i>
                  <span>地區:</span><span>${UVIData[i].County}</span>
                </p>
                <p class="card-text">
                  <i class="far fa-chart-bar mr-2 text-info"></i><span>發布單位：</span
                  ><span>${UVIData[i].PublishAgency}</span>
                </p>
                <p class="card-text">
                  <i class="far fa-clock mr-2 text-purple"></i><span>發布時間：</span
                  ><span>${UVIData[i].PublishTime}</span>
                </p>
              </div>
            </div>
          </div>
      `
    //將輸出的 items 一一加入陣列中
    content.push(items)
  }
  let contentStr = ''
  console.log('符合區域條件的資料數', content.length)
  for (i = 0; i < pageDataShow; i++) {
    contentStr += content[i]
  }
  dataItems.innerHTML = contentStr //將 for 迴圈建立好的 items 資料渲染到 HTML 上
  updateOption(zoneData) //更新option區域選項
  pagination(dataLen) //建立頁碼
  pageRecord = 1 //記錄頁碼
}
//-----------------初始化 END-----------------
//-----------------更新頁面-----------------
function updatePage(County) {
  let target
  // 帶入變數zone即可找相符名稱的資料
  if (County === '關注地區') {
    target = favoriteList
  } else {
    target = [...UVIData]
    target = target.filter(item => {
      return item.County === County
    })
  }
  let dataLen = target.length
  //更改區域標題名稱
  zoneTitle.textContent = County
  //每次呼叫function時先清空陣列內的內容
  content = []
  for (let i = 0; i < dataLen; i++) {
    //建立元素輸出的模板
    let favoriteIcon = 'far' // 預設輸出為空心的icon
    favoriteList.forEach(item => {
      if (item.SiteName === target[i].SiteName) {
        favoriteIcon = 'fas'
      }
    })
    let UVstatus
    let textColor
    if (target[i].UVI < 3) {
      UVstatus = 'success'
      textColor = 'muted'
    } else if (target[i].UVI >= 3 || target[i].UVI <= 5) {
      UVstatus = 'warning'
      textColor = 'white'
    } else if (target[i].UVI >= 6 || target[i].UVI <= 7) {
      UVstatus = 'orange'
      textColor = 'white'
    } else if (target[i].UVI >= 8 || target[i].UVI <= 10) {
      UVstatus = 'danger'
      textColor = 'white'
    } else {
      UVstatus = 'purple'
      textColor = 'white'
    }
    let items = `
          <div class="col-6">
            <div class="card mb-3">
              <div
                class="d-flex text-${textColor} py-6 justify-content-around align-items-end bg-${UVstatus} position-relative"
              >
                <a href="#" class="favorite btn text-danger">
                  <i class="${favoriteIcon} fa-heart "></i>
                </a>
                <h3 class="display-4 mb-0 ">${target[i].SiteName}</h3>
                <span class="">紫外線指數</span
                ><span class="display-4 ">${target[i].UVI}</span>
              </div>
              <div class="card-body">
                <p class="card-text">
                  <i class="fas fa-map-marker-alt mr-2 text-orange"></i>
                  <span>地區:</span><span>${target[i].County}</span>
                </p>
                <p class="card-text">
                  <i class="far fa-chart-bar mr-2 text-info"></i><span>發布單位：</span
                  ><span>${target[i].PublishAgency}</span>
                </p>
                <p class="card-text">
                  <i class="far fa-clock mr-2 text-purple"></i><span>發布時間：</span
                  ><span>${target[i].PublishTime}</span>
                </p>
              </div>
            </div>
          </div>
        `
    //將輸出的 items 一個一個加入陣列中
    content.push(items)
  }
  let contentStr = '' //用來裝從陣列拉出來渲染的資料
  console.log('符合區域條件的資料數', content.length)
  //判斷頁面渲染資料數
  // let acu = 0;
  if (content.length < pageDataShow) {
    //當資料數小於預設顯示數量時，則使用當前資料數量渲染
    for (i = 0; i < content.length; i++) {
      contentStr += content[i]
      // acu += 1;
      // console.log(acu);
    }
  } else if (content.length > pageDataShow) {
    //當資料數大於預設顯示數量時，則使用預設的數量渲染
    for (i = 0; i < pageDataShow; i++) {
      contentStr += content[i]
      // acu += 1;
      // console.log(acu);
    }
  }
  dataItems.innerHTML = contentStr
  pagination(content.length) //建立頁碼
  pageRecord = 1 //記錄頁碼
}
//-----------------更新頁面 END-----------------
//-----------------換頁-----------------
function paginationShow(currentPage) {
  let contentStr = ''
  console.log(currentPage)
  if ((currentPage === '< Previous') & (pageRecord - 1 < 1)) {
    //當目前頁碼再減1而小於1（已無頁面）時則停止更新頁面
    console.log('停止往前')
    return
  } else if (
    (currentPage === 'Next >') &
    (pageRecord + 1 > Math.ceil(content.length / pageDataShow))
  ) {
    //當頁碼往後大於資料頁數時則停止更新頁面
    console.log('停止往後')
    return
  } else if (currentPage === '< Previous') {
    //往前一頁時，以當前頁碼推算前一頁的陣列位置範圍
    for (
      i = (pageRecord - 2) * pageDataShow;
      i < (pageRecord - 1) * pageDataShow;
      i++
    ) {
      contentStr += content[i]
    }
    dataItems.innerHTML = contentStr
    console.log('往前一頁')
    pageRecord = parseInt(pageRecord) - 1 //記錄當下位置
  } else if (
    (currentPage === 'Next >') &
    (content.length - pageRecord * pageDataShow < pageDataShow)
  ) {
    //當往後一頁其剩下的資料數不足預設顯示資料數時，其渲染的範圍要做修正
    //渲染範圍改為當下頁碼推算到資料總數
    //此if雙條件要放在單純 next條件的前面，避免先吃到單純 next條件的if操作
    for (i = pageRecord * pageDataShow; i < content.length; i++) {
      contentStr += content[i]
    }
    dataItems.innerHTML = contentStr
    console.log('少於10比資料時的往後一頁')
    pageRecord = parseInt(pageRecord) + 1 //記錄當下位置
  } else if (currentPage === 'Next >') {
    for (
      i = pageRecord * pageDataShow;
      i < (pageRecord + 1) * pageDataShow;
      i++
    ) {
      contentStr += content[i]
    }
    dataItems.innerHTML = contentStr
    console.log('往後一頁')
    pageRecord = parseInt(pageRecord) + 1 //記錄當下位置
  } else if (content.length - (currentPage - 1) * pageDataShow < pageDataShow) {
    //當資料到最後一頁時，判斷當前陣列剩下的資料數是否比最大可呈現筆數小，若為true，則渲染剩下的陣列資料。
    //例如有 13 筆資料一次顯示 10 筆，則第 2 頁就是從陣列第 (currentPage - 1) * pageDataShow 的位置渲染到陣列最後一個 content.length 的位置
    for (i = (currentPage - 1) * pageDataShow; i < content.length; i++) {
      contentStr += content[i]
    }
    dataItems.innerHTML = contentStr
    pageRecord = parseInt(currentPage) //記錄當下位置
    console.log('最後一頁少於10筆時')
  } else {
    //依據頁碼推算陣列渲染的範圍
    for (
      i = (currentPage - 1) * pageDataShow;
      i < currentPage * pageDataShow;
      i++
    ) {
      contentStr += content[i]
    }
    dataItems.innerHTML = contentStr
    pageRecord = parseInt(currentPage) //記錄當下位置
    console.log('依照頁碼更新頁面')
  }
  // 直接設定以下的語法沒有上面的if條件，會在第2頁開始從i=10渲染到i=100
  // for (i = (currentPage - 1) * pageDataShow; i < content.length; i++) {
  //   contentStr += content[i];
  // }
  // dataItems.innerHTML = contentStr;
  console.log('記錄位置在第', pageRecord, '頁')
}
//-----------------換頁 END-----------------
//-----------------更新option區域選項-----------------
function updateOption(zoneData) {
  let zonDataContent = ''
  for (i = 0; i < zoneData.length; i++) {
    items = '<option>' + zoneData[i] + '</option>'
    zonDataContent += items
  }
  inputState.innerHTML =
    '<option disabled>-- 請選擇行政區 --</option><option selected>全部地區</option>' +
    zonDataContent
}
//-----------------更新option區域選項 END-----------------
//-----------------依資料數建立頁碼-----------------
function pagination(counter) {
  let pageContent = ''
  //Math.ceil(counter / pageDataShow) -1 是因第1頁已經在innerHTML預設渲染了
  for (i = 0; i < Math.ceil(counter / pageDataShow) - 1; i++) {
    let items =
      '<li class="page-item"><a class="page-link bg-transparent border-0" href="#">' +
      (i + 2) +
      '</a></li>'
    pageContent += items
  }
  pageNav.innerHTML =
    '<li class="page-item"><a class="page-link bg-transparent border-0" href="#">&lt;&nbsp;Previous</a></li><li class="page-item"><a class="page-link bg-transparent border-0" href="#">1</a></li>' +
    pageContent +
    '<li class="page-item"><a class="page-link bg-transparent border-0" href="#">Next&nbsp;&gt;</a></li>'
}
//-----------------依資料數建立頁碼 END-----------------

//----------------------------------xhr.onload END---------------------------------

//----------------------------------ScrollToTop----------------------------------
window.onscroll = function() {
  scrollBtnShow()
}
function scrollBtnShow() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollBtn.style.display = 'block'
  } else {
    scrollBtn.style.display = 'none'
  }
}
function scrollToTop() {
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
}
//----------------------------------Favorite----------------------------------
dataItems.addEventListener('click', function(e) {
  e.preventDefault()
  // console.log(e)
  // console.log(e.target.parentElement.parentElement.querySelector('h3'))
  if (
    e.target.classList.contains('far') &&
    e.target.classList.contains('fa-heart')
  ) {
    // let data = localStorage.getItem('favoriteList')
    favoriteList = JSON.parse(localStorage.getItem('favoriteList')) || []
    e.target.setAttribute('class', 'fas fa-heart')
    let favItem
    UVIData.forEach(item => {
      if (
        item.SiteName ===
        e.target.parentElement.parentElement.querySelector('h3').textContent
      ) {
        item.like = true
        favItem = item
      }
    })
    //上面forEach原本是用filter來過濾，但filter回傳的是陣列，若直接推到favoriteList裡面會變成大陣列中包著一個一個的陣列
    favoriteList.push(favItem)
    localStorage.setItem('favoriteList', JSON.stringify(favoriteList))
  } else if (
    e.target.classList.contains('fas') &&
    e.target.classList.contains('fa-heart')
  ) {
    favoriteList = JSON.parse(localStorage.getItem('favoriteList'))
    e.target.setAttribute('class', 'far fa-heart')
    favoriteList = favoriteList.filter(item => {
      return (
        item.SiteName !==
        e.target.parentElement.parentElement.querySelector('h3').textContent
      )
    })
    localStorage.setItem('favoriteList', JSON.stringify(favoriteList))
    // 當顯示頁面在關注地區時，移除喜愛的地區時會即時更新資料
    if (zoneTitle.textContent === '關注地區') {
      updatePage('關注地區')
    }
  }
  console.log(favoriteList)
})

//----------------------------------Favorite END----------------------------------
