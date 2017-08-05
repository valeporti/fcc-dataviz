/*
  try 2 components
    1.- editable part
    2.- the previewer
    if React Redux.. First Redux then React
*/
//"marked vaiable" already disponible (not needing to use: const marked = require('marked'))
//console.log(marked('I am using __markdown__ or **whatever**'))

/*
  Find out that it's better to, even with small applications, use Redux
  Because, when trying to pass state to parent, it implies that I should pass 
  functions from parent, which is not difficult but I don't like the idea, 
  I prefer to keep functions within components that will use them
*/

//REDUX
//const -> Types
const ADD = 'ADD' //to update input
const MOD = 'MOD' //to modify output
//ActionCreators
const modifyPrev = (output) => {return { type: MOD, output: output }}
const updateInp = (input) => {return { type: ADD, input: input }}
//Reducers
const editionReducer = (state = {}, action) => {
  //switch sequence
  //return: don't mutate the state, create a copy !!!
  //console.log(state)
  //console.log(action)
  switch (action.type) {
    case MOD:
      return Object.assign({}, state, {output: action.output})
    case ADD:
      return Object.assign({}, state, {input: action.input})
    default:
      return state
                     }
}
/* Problems using combineReducers 
const rootReducer = Redux.combineReducers({
  editionReducer: editionReducer
})
*/
//Create store with reducers
const store = Redux.createStore(editionReducer)
console.log(store.getState());

//REACT
//Presentational Components
class Presentational extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      //JSX
      <div id="markPrevContainer">
        <TextToPrevConnected />
        <PreviewerConnected />
      </div>
    )
  }
}

//Container Components
class TextToPrev extends React.Component {
  constructor(props) {
    super(props);
    //this is the only zone where you can freely use "this"
    //couldn't be able to bind "this" just using "ES6 Arrow functions"
    this.handleEdition = this.handleEdition.bind(this)
    //console.log(props)
  }
  //functions if wanted
  handleEdition(event) {
    //update state
    this.props.updateInp(event.target.value) // input updated
    let temp = event.target.value
    //console.log(typeof(temp)) //stirng
    let nextLineArr = temp.split(/\n/)
    //console.log(nextLineArr) 
    let finalArr = nextLineArr.map((currValue, index, arr) => {
      //console.log(arr.length + " & " + index)
      if (currValue == "") { //handle "next lines"
        return "<br>"
      }
      return marked(currValue)
    })
    finalArr = finalArr.join('')
    this.props.modifyPrev(finalArr)
  }
  render() {
    return (
      //JSX
      <div id="toeditRec">
       {/* First Aproach wrong: <input /> can't handle muliple lines */}
       {/* <input id="inputRec" type="text" placeholder="Here comes the text to Edit" /> */} 
       {/*//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css*/}
        <textarea id="inputRec" placeholder="Here comes the text to Edit" onChange={ this.handleEdition }/>
      </div>
    )
  }
}

class Previewer extends React.Component {
    constructor(props) {
    super(props)
    //this.state = {} 
  }
  //functions if wanted
  render() {
    return (
      //JSX
      <div id="prevRec">
        <span dangerouslySetInnerHTML={{__html: this.props.output }} />
      </div>
    )
  }
}

//REACT-REDUX
const Provider = ReactRedux.Provider //pass state/dispatch to react components
const connect = ReactRedux.connect //works to connect React to Redux
const mapStateToProps = (state) => {
  //console.log(state)
  return {input: state.input, output: state.output}
};

const mapDispatchToProps = (dispatch) => {
  return {
    modifyPrev: (output) => {
      dispatch(modifyPrev(output))
    },
    updateInp: (input) => {
      dispatch(updateInp(input))
    }
  }
};


//connect container components
const TextToPrevConnected = connect(mapStateToProps, mapDispatchToProps)(TextToPrev); 
const PreviewerConnected = connect(mapStateToProps)(Previewer); 

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
ReactDOM.render(<AppWrapper />, document.getElementById('markdownPreviewer'));