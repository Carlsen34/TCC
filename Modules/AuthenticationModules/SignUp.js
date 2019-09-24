import React from 'react';
import { TextInput, Button, StyleSheet,KeyboardAvoidingView } from 'react-native';
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from '../../aws-exports';
Amplify.configure(awsconfig);


export default class App extends React.Component {
  state = {
    username: '',
    password: '',
    email: '',
    confirmationCode: '',
    isSucessfulSingUp:false,
  };
  onChangeText(key, value) {
    this.setState({
      [key]: value,
    });
  }
  signUp() {
    Auth.signUp({
      username: this.state.username,
      password: this.state.password,
      attributes: {
        email: this.state.email,
      },
    })
      .then(() => {
        alert('Cadastro Realizado com Sucesso!');
        console.log('successful sign up!')
        this.setState({isSucessfulSingUp:true})
      }
      )
      .catch(err => { 
        alert('error signing up!: '+ err.message);
        console.log('error signing up!: ', err)
    });
  }
  confirmSignUp() {
    Auth.confirmSignUp(this.state.username, this.state.confirmationCode)
      .then(() => {
        alert('Cadastro Confirmado com Sucesso!');
        console.log('successful confirm sign up!')
      })
      .catch(err => {
        alert('Erro ao Confirmar Cadastro!: '+ err.message);
        console.log('error confirming signing up!: ', err)
    });
  }
  render() {
    if(!this.state.isSucessfulSingUp){
      return(
      <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TextInput
        onChangeText={value => this.onChangeText('username', value)}
        style={styles.input}
        placeholder="Usuario"
      />
      <TextInput
        onChangeText={value => this.onChangeText('password', value)}
        style={styles.input}
        secureTextEntry={true}
        placeholder="Senha"
      />
      <TextInput
        onChangeText={value => this.onChangeText('email', value)}
        style={styles.input}
        placeholder="Email"
      />
       <Button title="Cadastrar" onPress={this.signUp.bind(this)} />
       </KeyboardAvoidingView>
      )}
    else{

      return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
  
         
          <TextInput
            onChangeText={value => this.onChangeText('confirmationCode', value)}
            style={styles.input}
            placeholder="Codigo de Confirmação"
          />
          <Button
            title="Confirmar Cadastro"
            onPress={this.confirmSignUp.bind(this)}
          />
        </KeyboardAvoidingView>
      );

    }

  }
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    margin: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 16,
  },
});