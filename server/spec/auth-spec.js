var frisby = require("frisby");
var keys = require("../config/keys.js");
var token = keys.jwt.testToken;
var url = keys.baseURL;

describe("require(\"keys\")", function () {
    it("should include valid jwt and facebook keys", function () {
        var keys = require("../config/keys");
        expect(typeof keys.facebook.clientID).toBe("string");
        expect(typeof keys.facebook.clientID).toBe("string");
        expect(typeof keys.jwt.secret).toBe("string");
    });
});

frisby.create("Stop Users Without Tokens")
    .get(url + "api")
    .expectStatus(403)
.toss();

frisby.create("Stop Requests With Bad Tokens")
    .get(url + "api")
    .addHeader("x-auth-token", "SomeBadToken")
    .expectStatus(401)
.toss();

frisby.globalSetup({ // globalSetup is for ALL requests
    request: {
        headers: { 'x-auth-token': token }
    }
});
frisby.create("Allow Users With Valid Tokens")
    .get(url + "api")
    .expectStatus(200)
.toss();

