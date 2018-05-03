'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('BlogPosts', function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });
  it('should list blog posts on GET', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);
        //Can also say 'to.be.above(0);
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.have.all.keys(
            'id', 'title', 'content', 'author', 'publishDate');
        });
      });
  });
  it('should add blog posts on POST', function() {
    const blogPOST = {
      title: 'This is a test blog post',
      content: 'This is some test content',
      author: 'This authoer is named \'test!\''
    };
    const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
    return chai.request(app)
      .post('/blog-posts')
      .send(blogPOST)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys(expectedKeys);
        expect(res.body).not.to.equal(null);
      });
  });
  it('should update blog posts on PUT', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        const updatePost = Object.assign(res.body[0], {
          title: 'This title was UPDATED!',
          content: 'This content has been updated and updated and PUT'
        });
        return chai.request(app)
          .put(`/blog-posts/${res.body[0].id}`)
          .send(updatePost)
          .then(function(res) {
            expect(res).to.have.status(204);
          });
      });
  });
  it('should delete blog posts on DELETE', function() {
    return chai.request(app)
      .get('/blog-posts/')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`)
          .then(function(res) {
            expect(res).to.have.status(204)
          });
      });
  });
});