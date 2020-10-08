const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-2' });
const fs = require('fs');

const testUsers = ['Test1', 'Test2', 'Test3'];

const testPolicy1 = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "s3:GetAccessPoint",
                "s3:GetLifecycleConfiguration",
                "s3:GetBucketTagging",
                "s3:GetInventoryConfiguration",
                "s3:GetObjectVersionTagging",
                "s3:ListBucketVersions",
                "s3:GetBucketLogging",
                "s3:GetAccelerateConfiguration",
                "s3:GetBucketPolicy",
                "s3:GetObjectVersionTorrent",
                "s3:GetObjectAcl",
                "s3:GetEncryptionConfiguration",
                "s3:GetBucketObjectLockConfiguration",
                "s3:GetBucketRequestPayment",
                "s3:GetAccessPointPolicyStatus",
                "s3:GetObjectVersionAcl",
                "s3:GetObjectTagging",
                "s3:GetMetricsConfiguration",
                "s3:GetBucketPublicAccessBlock",
                "s3:GetBucketPolicyStatus",
                "s3:ListBucketMultipartUploads",
                "s3:GetObjectRetention",
                "s3:GetBucketWebsite",
                "s3:GetJobTagging",
                "s3:ListAccessPoints",
                "s3:ListJobs",
                "s3:GetBucketVersioning",
                "s3:GetBucketAcl",
                "s3:GetObjectLegalHold",
                "s3:GetBucketNotification",
                "s3:GetReplicationConfiguration",
                "s3:ListMultipartUploadParts",
                "s3:GetObject",
                "s3:GetObjectTorrent",
                "s3:GetAccountPublicAccessBlock",
                "s3:DescribeJob",
                "s3:GetBucketCORS",
                "s3:GetAnalyticsConfiguration",
                "s3:GetObjectVersionForReplication",
                "s3:GetBucketLocation",
                "s3:GetAccessPointPolicy",
                "s3:GetObjectVersion"
            ],
            "Resource": "*",
            "Condition": {
                "BoolIfExists": {
                    "aws:MultiFactorAuthPresent": "true"
                }
            }
        }
    ]
};

const testPolicy2 = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Deny",
            "Action": "iam:CreateUser",
            "Resource": "*",
            "Condition": {
                "BoolIfExists": {
                    "aws:MultiFactorAuthPresent": "true"
                }
            }
        }
    ]
};

const testRole = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
};

const policyARNS = [
    'arn:aws:iam::086967391706:policy/AAA_Test_Policy1',
    'arn:aws:iam::086967391706:policy/AAA_Test_Policy2'
];

const iam = new AWS.IAM();
const s3 = new AWS.S3();

const config = {
    Users: testUsers,
    Policies: {
        testPolicy1,
        testPolicy2
    },
    Roles: testRole,
    PolicyARNS: policyARNS
};


//Save config to S3 Bucket
var readableConfig = JSON.stringify(config)

fs.writeFileSync("test_config.txt", readableConfig, function (err) {
    if (err) {
        console.log("Error: ", err)
    } else {
        console.log("Config written successfully");
    }
});

//Uncomment if creating a S3 bucket is required.

// s3.createBucket({ Bucket: "ryanvdetestbucket01.s3.ap-southeast-2.amazonaws.com" }, function (err, data) {
//     if (err) {
//         console.log("Error: ", err);
//     } else {
        console.log("Success", data);
        s3.upload({
            Bucket: "ryanvdetestbucket01.s3.ap-southeast-2.amazonaws.com",
            Key: "test_config.txt",
            Body: fs.createReadStream("test_config.txt")
        }, function (err, data) {
            if (err) {
                console.log("Error: ", err);
            } else {
                console.log("Upload Success", data);
            }
        });
//     }
// });



//Create Test Users
testUsers.forEach(username => iam.createUser({ UserName: username }, function (err, data) {
    if (err) {
        console.log("Error: ", err);
    } else {
        console.log("Success", data);
    }
}));

const asyncThingsToDo = [
    createTestRole(),
    createTestPolicies(),
];

//Initalise Test Role and Role Policies
function createTestRole() {
    iam.createRole({
        AssumeRolePolicyDocument: JSON.stringify(testRole),
        Path: "/",
        RoleName: "TestRole"
    }, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Success", data);

        }
    });
};

function createTestPolicies(){
    iam.createPolicy({
        PolicyDocument: JSON.stringify(testPolicy1),
        PolicyName: "AAA_Test_Policy1"
    },
        function (err, data) {
            if (err) {
                console.log("Error: ", err);
            } else {
                console.log("Success", data)
                iam.attachRolePolicy({
                    PolicyArn: 'arn:aws:iam::086967391706:policy/AAA_Test_Policy1',
                    RoleName: 'TestRole'
                }, function (err, data) {
                    if (err) {
                        console.log("Error: ", err);
                    } else {
                        console.log("Success 1");
                    }
                });
            }
        });

        iam.createPolicy({
            PolicyDocument: JSON.stringify(testPolicy2),
            PolicyName: "AAA_Test_Policy2"
        },
            function (err, data) {
                if (err) {
                    console.log("Error: ", err);
                } else {
                    console.log("Success", data)
                    iam.attachRolePolicy({
                        PolicyArn: 'arn:aws:iam::086967391706:policy/AAA_Test_Policy2',
                        RoleName: 'TestRole'
                    }, function (err, data) {
                        if (err) {
                            console.log("Error: ", err);
                        } else {
                            console.log("Success 2");
                        }
                    });
                }
            });
}

async function InitaliseRoles(){
const starterPromise = Promise.resolve(null);
    await asyncThingsToDo.reduce(
        (p, spec) => p.then(() => spec),
        starterPromise
    );
};

InitaliseRoles();

