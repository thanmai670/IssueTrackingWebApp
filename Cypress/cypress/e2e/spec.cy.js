const faker = require("faker");

describe('spec.cy.js', () => {
  
  beforeEach(() => {

    cy.visit('http://localhost:3000/');

  })

  var firstName = faker.name.findName();
  var emailList = faker.internet.email();

  it('Login Test',()=>{

    cy.get('#email').type('cypress@cypress.com')
    cy.get('#password').type('12345678')
    cy.get('#login').click()

  })

  
  it('Sign in Test',()=>{


    cy.get('#signup').click()
    cy.get('#username').type(firstName)
    cy.get('#email').type(emailList)
    cy.get('#password').type('cypress12345')
    cy.get('#confirmpassword').type('cypress12345')
    cy.get('#signup').click()
    cy.wait(500)
    cy.get('#logout').click()
     cy.get('#email').type(emailList)
     cy.get('#password').type('cypress12345')
    cy.get('#login').click()
    cy.get('#logout').click()
  })

  it('Add and Delete Board',()=>{

    cy.get('#email').type(emailList)
    cy.get('#password').type('cypress12345')
    cy.get('#login').click()
    cy.get('#AddIssueList').click()
    cy.get('.btn-secondary').contains('Delete List').eq(0).click();
    // cy.get('#addIssue').click()
    // cy.wait(500)
    // cy.get('#editCard').click()
    // cy.get('#inputModal').type('test')
  })

  it('Add issue',()=>{

    cy.get('#email').type(emailList)
    cy.get('#password').type('cypress12345')
    cy.get('#login').click()
    cy.get('#AddIssueList').click()
    cy.get('#addIssue').click()
    cy.get('.btn-secondary').contains('Delete List').eq(0).click();
    // cy.wait(500)
    // cy.get('#editCard').click()
    // cy.get('#inputModal').type('test')
  })

  
  it('edit issue',()=>{

    cy.get('#email').type(emailList)
    cy.get('#password').type('cypress12345')
    cy.get('#login').click()
    cy.get('#AddIssueList').click()
    cy.get('#addIssue').click()
    cy.get('#editCard').click()
    cy.get('#inputModal').type('testing Modal',{force: true})
    cy.get('#closeBtn').click()
    cy.get('.issueList').contains('testing Modal')
    cy.get('.btn-secondary').contains('Delete List').eq(0).click();
  })



  
  // it('Add Button label check', () => {

  //   cy.get('.btn-primary').contains('Add Issue List');
  // })

  // it('Delete Button Label Check', () => {

  //   cy.get('.btn-secondary').contains('Delete List');
  // })

  // it('Add Button click test', () => {

  //   cy.get('.btn-primary').contains('Add Issue List').eq(0).click();
  // })

  // it('Delete Button click test', () => {

  //   cy.get('.btn-secondary').contains('Delete List').eq(0).click();
  // })

  // it('Modal test', () => {

  //   cy.get('.issueList').eq(0).click({force:true});
  // })

  // it('Login Page visit Check', () => {

  //   cy.visit('http://localhost:3000/');
  // })



})
