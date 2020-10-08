const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();
const iam = new AWS.IAM();

// exports.handler = async (event) => {
// var user = iam.getUser({Username: "Test1"}).promise();
// (await user).User.PermissionsBoundary


// }

iam.listRoles({}, function(err, data){
    if (err){
        console.log("Error: ", err);
    } else {
        var roles = data.Roles;
        roles.forEach(function (val, index, array){
            console.log(val.RoleName);
            console.log(val.AssumeRolePolicyDocument);
        })
    }
})

iam.getUser({UserName: Test1}, function(err, data){
    if(err){
        console.log("Oops", err);
    } else {
        var user = data.User;
        console.log(user.PermissionsBoundary);
    }
})