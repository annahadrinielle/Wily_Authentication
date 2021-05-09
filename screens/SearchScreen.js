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
              onChangeText={(text)=>{this.setState({search:text})}}
           />

           <TouchableOpacity
              style = {styles.searchButton}
              onPress={()=>{this.searchTransactions(this.state.search)}}
           > <Text>Search</Text>
           </TouchableOpacity>
         </View>
         {/* 
            We are using a FlatList component to display the transaction documents we got from the db 
            when we searched for a book id or student id.
            1. data is a prop of FlatList that tells what data the FlatList will display.
            2. renderItem is a prop of FlatList that returns a component each an item of the FlatList will
                be rendered in the form of that component 
                (we are using a View component which has 4 texts:
                    bookid
                    studentid
                    transaction type (issue/return)
                    date of transaction ( timestamp value converted to date using toDate()
                )
            3. keyExtractor is a prop of FlatList that tells what should be the unique key for each item in FlatList
                (for the key we are using index of the allTransactions array after converting it to string using toString()
                because unique key needs to be a string but index is a number so we convert it to string)
                
            4. onEndReached is a prop of FlatList that will have a function which tells what to do when end of the FlatList is reached
                (in onEndReached we have written a function that fetches more transactions from the db so that 
                we can show them in our FlatList once user sees all the transactions that are there in the FlatList now)
            
            5. onEndReachedThreshold is a prop of FlatList that tells what part of the FlatList is reached by the user when 
                onEndReached should be called (e.g. 0.5 means when half of the list is seen by the user, onEndReached should be called)
            
         */}
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
