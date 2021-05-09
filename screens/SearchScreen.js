import React from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import db from '../config'
import { ScrollView } from 'react-native-gesture-handler';



export default class Searchscreen extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        allTransactions: [],
        lastVisibleTransaction: null,
        search:''
      }
    }

    //this function fetches more transactions from db when you have reached end of list of books displayed on your screen
    fetchMoreTransactions = async ()=>{
      var text = this.state.search.toUpperCase()
      var enteredText = text.split("")
      //split() splits a string into different parts and stores the parts in an array
      //enteredText will be an array which contains the letters of the text entered in search bar
      
      //if first letter of the text is B that means we searched a book id
      if (enteredText[0].toUpperCase() ==='B'){   
        const query = await db.collection("transactions").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
          //where() is getting only those transactions where book id is same as text entered in search bar
          //lastVisibleTransaction state will store the last document we got from db
          //startAfter will start getting transactions from the db which are after the lastVisibleTransaction in the database
          //documentation at https://firebase.google.com/docs/firestore/query-data/query-cursors

        query.docs.map((doc)=>{
           this.setState({
              // ... will put or insert all elements of allTransactions array where ...this.state.allTransactions is written
              //this will add doc.data() to allTransactions array after all the elements that were already in the array
             allTransactions: [...this.state.allTransactions, doc.data()],
             lastVisibleTransaction: doc
           })
        })
      }
      //if first letter of the text is S that means we searched a student id
      else if(enteredText[0].toUpperCase() === 'S'){
        const query = await db.collection("transactions").where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
        query.docs.map((doc)=>{
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc
          })
        })
      }
  }

    searchTransactions= async(text) =>{
      var enteredText = text.split("")
      var text = text.toUpperCase()
  
      
      if (enteredText[0].toUpperCase() ==='B'){
        const transaction =  await db.collection("transactions").where('bookId','==',text).get()
        transaction.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction: doc
          })
        })
      }
      else if(enteredText[0].toUpperCase() === 'S'){
        const transaction = await db.collection('transactions').where('studentId','==',text).get()
        transaction.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction: doc
          })
        })
      }
    }

    componentDidMount = async ()=>{
      const query = await db.collection("transactions").limit(10).get()
      query.docs.map((doc)=>{
        this.setState({
          allTransactions: [],
          lastVisibleTransaction: doc
        })
      })
    }
    render() {
      return (
        <View style={styles.container}>
          <View style={styles.searchBar}>
        <TextInput 
          style ={styles.bar}
          placeholder = "Enter Book Id or Student Id"
          onChangeText={(text)=>{this.setState({search:text})}}/>
          <TouchableOpacity
            style = {styles.searchButton}
            onPress={()=>{this.searchTransactions(this.state.search)}}
          >
            <Text>Search</Text>
          </TouchableOpacity>
          </View>
        <FlatList
          data={this.state.allTransactions}
          renderItem={({item})=>(
            <View style={{borderBottomWidth: 2}}>
              <Text>{"Book Id: " + item.bookId}</Text>
              <Text>{"Student id: " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: " + item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor= {(item, index)=> index.toString()}
          onEndReached ={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        /> 
        </View>
      );
    }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })
