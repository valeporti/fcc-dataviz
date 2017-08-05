//REDUX
//const -> Types
//Regarding state we just need to save the first time the info, then just grab it
const addRECENT = "addRECENT"
const addALLTMS = "addALLTMS"
const chngTO = "chngTO"
const chngINNER = "chngINNER"
const INC = "INC"

//ActionCreators
const addrecent = (json) => {return { type: addRECENT, recent: json }}
const addalltime = (json) => {return { type: addALLTMS, alltime: json }}
const chngSource = (source) => {return { type: chngTO, pointTo: source }}
const chngInSource = (source) => {return { type: chngINNER, inn: source }}
const increasing = (inc) => {return { type: INC, inc: inc }}

//Reducers
const addReducer = (state = {inc: false, inn: "recent", pointTo: ""}, action) => {
  switch (action.type) {
    case addRECENT:
      return Object.assign({}, state, {recent: action.recent})
    case addALLTMS:
      return Object.assign({}, state, {alltime: action.alltime})
    case chngTO:
      return Object.assign({}, state, {pointTo: action.pointTo})
    case INC:
      return Object.assign({}, state, {inc: action.inc})
    case chngINNER:
      return Object.assign({}, state, {inn: action.inn})
    default:
      return state
                     }
}
/*
const chngReducer = (state = {}, action) => {
  switch (action.type) {
    case chngTO:
      return Object.assign({}, state, {poinTo: action.poinTo})
    default:
      return state
                     }
}
const rootReducer = Redux.combineReducers({
  addReducer,
  chngReducer
})
*/
//Create store with reducers
const store = Redux.createStore(addReducer)
//console.log(store.getState());

//REACT
//Presentational Components
//When to starting developing the presentation.. eliminate all the "React-Redux" components to be able to actually render
class Presentational extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div id="bigDaddy">
        <OptionsConnected />
        <TableConnected />
      </div>
    )
  }
}
//Container Components
class Table extends React.Component {
  constructor(props) {
    //console.log("executed constructor")
    super(props)
    console.log(props)
    this.handleClick = this.handleClick.bind(this)
  }
  shouldComponentUpdate(nextProps, nextState) { //to prevent double rendering if not needed
    //console.log("should I updte?")
    if (nextProps.recent == this.props.recent && nextProps.alltime == this.props.alltime && nextProps.pointTo == this.props.pointTo) {
      //console.log("update prevented")
      return false;
    }
    //console.log("no prevention")
    return true;
  }
  componentDidMount() { //after mounting, put calls to server
    //console.log("executed componentDidMount")
    //this.props.increasing(false) //initialize variable BETTER TO INITIALIZE IN REDUX REDUCERS DEFAULT STATE
    this.camperRecent()
    this.camperAllTimes()
    //console.log("passed")
    //console.log(this.camperRecent())
  }
  camperRecent() {
    return $.getJSON("https://fcctop100.herokuapp.com/api/fccusers/top/recent", () => {
      //console.log("succes Recent JSON request")
    })
    .done((json) => {
      //console.log(json)
      //update State with info && update table
      this.props.addrecent(json)
      this.props.chngSource("recent") //as default, start pointing to recent
      //console.log(this.props)
    })
    .fail(( jqxhr, textStatus, error ) => {
      console.log("Request Failed: " +  textStatus + ", " + error)
    })
  }
  camperAllTimes() {
    return $.getJSON("https://fcctop100.herokuapp.com/api/fccusers/top/alltime", () => {
      //console.log("succes alltime JSON request")
    })
    .done((json) => {
      //console.log(json)
      //update State with info && update table
      this.props.addalltime(json)
    })
    .fail(( jqxhr, textStatus, error ) => {
      console.log("Request Failed: " +  textStatus + ", " + error)
    })
  }
  handleClick (event, pressed) {
    console.log(pressed)
    const showing = this.props.pointTo;
    this.props.chngSource(pressed)
    this.props.chngInSource(pressed)
    const dispatchTo = "add" + showing;
    const incOrdec = !this.props.inc;
    this.props.increasing(incOrdec)
    //Object.assign({}, state, {inc: action.inc})
    let arrayObjToSort = this.props[showing];
    console.log(incOrdec)
      //usage: (arrayOfObjects, key in objects to sort **should be a number**, increasing or decreasing)
    console.log("showing " + showing + " inc " + incOrdec)
    arrayObjToSort = sortObjArr(arrayObjToSort, showing, incOrdec)
    //console.log(arrayObjToSort)
    this.props[dispatchTo](arrayObjToSort) 
  }
  render() {
    //render items before putting them in the return function
    let pointTo = this.props.pointTo
    //console.log(pointTo)
    let toRend = [{
        username: "No Content",
        recent: "No Content",
        alltime: "No Content"
      }];
    let inn = this.props.inn
    let iconRec = ""
    let iconAll = ""
    const incOrdec = this.props.inc
    //initialize the variable to render
    if (pointTo == "recent" || pointTo == "alltime") {
      //when calls have been done, render the desired info
      //console.log(this.props)
      toRend = this.props[pointTo]
      //console.log(this.props.pointTo)
      //console.log(this.props.recent)
      if (inn == "recent") {
        if(incOrdec == false) {
          iconRec = <i className="fa fa-sort-asc" aria-hidden="true" />;
        } else {
          iconRec = <i className="fa fa-sort-desc" aria-hidden="true" />
        }
        iconAll = ""
      } 
      else if (inn == "alltime") {
        if(incOrdec == false) {
          iconAll = <i className="fa fa-sort-asc" aria-hidden="true" />;
        } else {
          iconAll = <i className="fa fa-sort-desc" aria-hidden="true" />
        }
        iconRec = ""
      }
    }
      //console.log("its not undefined")
    
      let info = toRend.map( (item, i) => {
        let JSX = (
          <tr key={i}>
            <td><div className="each-cell"><div className="cell-content">{i + 1}</div></div></td>
            <td><div className="each-cell"><div className="imageInCell"><img src={item.img}/></div><div className="userCell">{item.username}</div></div></td>
            <td><div className="each-cell"><div className="cell-content">{item.recent}</div></div></td>
            <td><div className="each-cell"><div className="cell-content">{item.alltime}</div></div></td>
          </tr>
        )
        return JSX
      }); 
    
    return (
      <div id="tableContainer">
        <table id="campersTable">
          <thead>
          <tr>
            <th><div className="each-cell numFilt filt">#</div></th>
            <th className="camperCol"><div className="each-cell">Camper</div></th>
            <th><div className="each-cell recentFilt filt" onClick={(event) => {this.handleClick(event, "recent")}}>Recent Brownies&nbsp;{iconRec}</div></th>
            <th><div className="each-cell allFilt filt" onClick={(event) => {this.handleClick(event, "alltime")}}>AllTime Brownies&nbsp;{iconAll}</div></th>
          </tr>
          </thead>
          <tbody>
            {info}
          </tbody>
        </table>
      </div>
    )
  }
}
class Options extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    //console.log(props)
  }
  handleClick(event, passed) {
    //console.log(event.target.value)
    if (passed == "recent") {
      this.props.chngSource("recent")
    }
    if (passed == "alltime") {
      this.props.chngSource("alltime")
    }
  }
  render() {
    return (
      <div id="tableHeader">
        <div id="tableTitle" className="tbHdElement">Leaderboard</div>
        <div className="tbHdElement recentbtnDiv"><button className="btns recentbtn" onClick={(event) => {this.handleClick(event, "recent")}}>Show Recent</button></div>
        <div className="tbHdElement alltmsbtnDiv"><button className="btns alltmsbtn" onClick={(event) => {this.handleClick(event, "alltime")}}>Show All Times</button></div>
      </div>
    )
  }
}

//REACT-REDUX
const Provider = ReactRedux.Provider //pass state/dispatch to react components
const connect = ReactRedux.connect //works to connect React to Redux
const mapStateToProps = (state) => {
  //console.log("state")
  //console.log(state)
  return {recent: state.recent, alltime: state.alltime, pointTo: state.pointTo, inc: state.inc, inn: state.inn}
};

const mapDispatchToProps = (dispatch) => {
  return {
    addrecent: (recentCampers) => {
      dispatch(addrecent(recentCampers))
    },
    addalltime: (alltimeCampers) => {
      dispatch(addalltime(alltimeCampers))
    },
    chngSource: (source) => {
      //console.log(source)
      dispatch(chngSource(source))
    },
    increasing: (inc) => {
      dispatch(increasing(inc))
    },
    chngInSource: (source) => {
      dispatch(chngInSource(source))
    }
  }
};
//console.log(store.getState())
//connect container components
const TableConnected = connect(mapStateToProps, mapDispatchToProps)(Table); 
const OptionsConnected = connect(null, mapDispatchToProps)(Options);
//Envolve Store with the highest level component -> to have acces to the store in all components
class AppWrapper extends React.Component {
	render() {
		return (
			<Provider store={store}>
			  <Presentational />
			</Provider>
		);
	}
};

/*
 * Render the above component into the div#app
 */
ReactDOM.render(<AppWrapper />, document.getElementById('leaderBoard')); //change to AppWrapper

/*
  Helpers
*/
/*
  Function which is intended to sort an array of objects
  you can choose if the sorting should be incremental or decremental (3rd argument true or false)
  usage: (arrayOfObjects, key in objects to sort **should be a number**, increasing or decreasing)
*/
function sortObjArr (arr, key, increasing) {
  //extract array
  let toSortArr = [];
  for (let i = 0; i < arr.length; i ++) {
    toSortArr[i] = arr[i][key]
  }
  //sort Array
  sort(toSortArr, increasing)
  //populate new array of objects with ordered items
  let indexLocatedKeys = [];
  let objArrSorted = new Array(arr.length);
  for (let i = 0; i < arr.length; i ++) {
    //key to locate
    let toLocateKey = arr[i][key];
    let startOn = 0;
    let next = true;
    //check if repeated key, else locate in position
    while (next) {
      let destinyIndex = toSortArr.indexOf(toLocateKey, startOn);
      if (destinyIndex < 0) {
        next = false;
        console.log("Error: element not found");
        break;
      }
      if (indexLocatedKeys.indexOf(destinyIndex) < 0) { //if not found, means it hasn't been integrated to array
        next = false;
        objArrSorted[destinyIndex] = arr[i];
      }
      indexLocatedKeys.push(destinyIndex);
      startOn = destinyIndex + 1; //it's the index found
    }
  }
  //return array of objects
  //console.log(objArrSorted)
  return objArrSorted;
}
/*
  Sort the array in incremental (true) or decremental (false) way
*/
function sort(array, inc) {
  function merge(arr, left, right, increasing) {
    //for each value in left array, compare with first/next right array value
    let lL = left.length;
    let lR = right.length;
    let iL = 0;
    let iR = 0;
    for (let i = 0; i < arr.length; i ++) { //we know that arr.lenght = left.lenght + right.lenght
      //start comparing
      if (increasing && left[iL] <= right[iR] && iL < lL) { //study if left part is equal or the same to cover all possibilities
        arr[i] = left[iL]; //overwrite final array since it will be the sorted one for parent iteration
        iL ++; // since we're not studing anymore that element of that array
      } 
      else if (increasing && left[iL] > right[iR] && iR < lR) { //means left[iL] > right[iR]
        arr[i] = right[iR];
        iR ++;
      }
      else if (!increasing && left[iL] <= right[iR] && iL < lL) {
        arr[i] = right[iR]; //overwrite final array since it will be the sorted one for parent iteration
        iR ++;
      } 
      else if (!increasing && left[iL] > right[iR] && iR < lR) {
        arr[i] = left[iL];
        iL ++;
      }
      else if (iL == lL || iR == lR) { 
        //if there is nothing to compare, we just have to concatenate the array just created,
        //with the remaining array, it could be the left or right remaining
        if (iL != lL) {
          arr[i] = left[iL];
          iL ++;
        }
        if (iR != lR) {
          arr[i] = right[iR]
          iR ++;
        }
      }
      else {
        console.log("Error: not getting into")
      }
    }
  }
  //begining of Sorting
  let length = array.length;
  if (length < 2) { //when there is just one element, stop there and start merging with the other elements
    return;
  }
  //split into two arrays
  let mod = length % 2; // 0 or 1
  let leftL = (length - mod) / 2; // will give us always left length (smallest)
  let rightL = length - leftL;
  let aL = array.slice(0, leftL)
  let aR = array.slice(leftL)
  //continuie spliting....
  sort (aL, inc)
  sort (aR, inc)
  merge (array, aL, aR, inc) 
}
