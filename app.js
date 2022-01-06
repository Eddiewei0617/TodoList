let section = document.querySelector("section");
let add = document.querySelector("form button");
add.addEventListener("click", (e) => {
  e.preventDefault();

  // get the input values
  let form = e.target.parentElement;
  let todoText = form.children[0].value;
  let todoMonth = form.children[1].value;
  let todoDate = form.children[2].value;

  if (todoText === "") {
    alert("please enter some text");
    return; // 記得加return，不然下面還是會繼續執行，跑出新的item
  }

  // create a todo
  let todo = document.createElement("div");
  todo.classList.add("todo");
  let text = document.createElement("p");
  text.classList.add("todo-text");
  text.innerText = todoText;
  let time = document.createElement("p");
  time.classList.add("todo-time");
  time.innerText = todoMonth + "/" + todoDate;
  todo.appendChild(text);
  todo.appendChild(time);

  section.appendChild(todo);

  // create check button and trash button
  let completeButton = document.createElement("button");
  completeButton.classList.add("complete");
  completeButton.innerHTML = '<i class="far fa-check-square"></i>';
  completeButton.addEventListener("click", (e) => {
    let todoItem = e.target.parentElement;
    todoItem.classList.toggle("done");
  });

  let trashButton = document.createElement("button");
  trashButton.classList.add("trash");
  trashButton.innerHTML = '<i class="far fa-trash-alt"></i>';
  trashButton.addEventListener("click", (e) => {
    let todoItem = e.target.parentElement;

    // 這裡就是所謂的非同步事件，設定聆聽事件的callback function，等下面的動畫完成後回來執行todoItem.remove();  start-------------
    todoItem.addEventListener("animationend", () => {
      // reomove from localStorage
      // 不能用localStorage.removeItem 是因為我們只有一個key("list")，如果刪了，其他的待辦清單也會被刪掉
      let text = todoItem.children[0].innerText;
      let myListArray = JSON.parse(localStorage.getItem("list"));
      myListArray.forEach((item, index) => {
        if (item.todoText == text) {
          myListArray.splice(index, 1);
          localStorage.setItem("list", JSON.stringify(myListArray));
        }
      });
      todoItem.remove();
    });
    todoItem.style.animation = "scaleDown 0.4s forwards";
    // end ---------------------------------------------
  });

  todo.appendChild(completeButton);
  todo.appendChild(trashButton);

  todo.style.animation = "scaleUp 0.4s forwards";

  // 把新增的Todo存進localStorage, start-----------------------
  // create an object
  let myTodo = {
    todoText: todoText,
    todoMonth: todoMonth,
    todoDate: todoDate,
  };
  // store data into an array of objects
  let myList = localStorage.getItem("list");
  if (myList == null) {
    localStorage.setItem("list", JSON.stringify([myTodo]));
  } else {
    let myListArray = JSON.parse(myList);
    myListArray.push(myTodo);
    localStorage.setItem("list", JSON.stringify(myListArray));
  }
  // 把新增的Todo存進localStorage, end-----------------------

  form.children[0].value = ""; // clear the text input
  section.appendChild(todo);
});

loadData();
function loadData() {
  // 處理關掉瀏覽器，再打開來要顯示的TodoList， start----------------------
  let myList = localStorage.getItem("list");
  if (myList !== null) {
    let myListArray = JSON.parse(myList);
    myListArray.forEach((item) => {
      // create a todo
      let todo = document.createElement("div");
      todo.classList.add("todo");
      let text = document.createElement("p");
      text.classList.add("todo-text");
      text.innerText = item.todoText;
      let time = document.createElement("p");
      time.classList.add("todo-time");
      time.innerText = item.todoMonth + "/" + item.todoDate;
      todo.appendChild(text);
      todo.appendChild(time);

      // create check button and trash button
      let completeButton = document.createElement("button");
      completeButton.classList.add("complete");
      completeButton.innerHTML = '<i class="far fa-check-square"></i>';
      completeButton.addEventListener("click", (e) => {
        let todoItem = e.target.parentElement;
        todoItem.classList.toggle("done");
      });

      let trashButton = document.createElement("button");
      trashButton.classList.add("trash");
      trashButton.innerHTML = '<i class="far fa-trash-alt"></i>';
      trashButton.addEventListener("click", (e) => {
        let todoItem = e.target.parentElement;
        // 這裡就是所謂的非同步事件，設定聆聽事件的callback function，等下面的動畫完成後回來執行todoItem.remove(); -------------
        todoItem.addEventListener("animationend", () => {
          // reomove from localStorage
          let text = todoItem.children[0].innerText;
          let myListArray = JSON.parse(localStorage.getItem("list"));
          myListArray.forEach((item, index) => {
            if (item.todoText == text) {
              myListArray.splice(index, 1);
              localStorage.setItem("list", JSON.stringify(myListArray));
            }
          });
          todoItem.remove();
        });
        todoItem.style.animation = "scaleDown 0.4s forwards";
        // ---------------------------------------------
      });
      todo.appendChild(completeButton);
      todo.appendChild(trashButton);

      section.appendChild(todo);
    });
  }
  // 處理關掉瀏覽器，再打開來要顯示的TodoList， end----------------------
}

//------------------------------------------------------------------

// 處理排序狀況，使用merge sort的方式(將陣列分為左右兩邊，倆倆比較，輸的被挑出來，贏的繼續比)， start---------------------------------
function mergeTime(arr1, arr2) {
  let result = [];
  let i = 0;
  let j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (Number(arr1[i].todoMonth) > Number(arr2[j].todoMonth)) {
      result.push(arr2[j]);
      j++;
    } else if (Number(arr1[i].todoMonth) < Number(arr2[j].todoMonth)) {
      result.push(arr1[i]);
      i++;
    } else if (Number(arr1[i].todoMonth) == Number(arr2[j].todoMonth)) {
      if (Number(arr1[i].todoDate) > Number(arr2[j].todoDate)) {
        result.push(arr2[j]);
        j++;
      } else {
        result.push(arr1[i]);
        i++;
      }
    }
  }
  // 上面比完之後有可能是左邊贏也有可能是右邊贏，那就會只剩下他自己，就放進result吧
  while (i < arr1.length) {
    result.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    result.push(arr2[j]);
    j++;
  }
  return result;
}

// 接下來開始判斷並找出要怎麼分成兩隊來比大小
// 補充: slice，是切割陣列成新陣列的方法，slice(start, end)，()裡的數字是指index，所以從0開始，而start->inclusive ; end->exclusive要特別注意
function mergeSort(arr) {
  if (arr.length === 1) {
    return arr;
  } else {
    let middle = Math.floor(arr.length / 2);
    let right = arr.slice(0, middle);
    let left = arr.slice(middle, arr.length);
    return mergeTime(mergeSort(right), mergeSort(left));
  }
}
// console.log(mergeSort(JSON.parse(localStorage.getItem("list"))));

// 按了排序按鈕之後，依照日期大小排序
let sortButton = document.querySelector("div.sort button");
sortButton.addEventListener("click", () => {
  // sort data
  let sortedArray = mergeSort(JSON.parse(localStorage.getItem("list")));
  localStorage.setItem("list", JSON.stringify(sortedArray));

  // remove data (將原本的list先刪除，上面排序好的才能set進去)
  let len = section.children.length;
  for (let i = 0; i < len; i++) {
    section.children[0].remove();
  }

  // load data
  loadData();
});
// 處理排序狀況，使用merge sort的方式(將陣列分為左右兩邊，倆倆比較，輸的被挑出來，贏的繼續比)， end---------------------------------
