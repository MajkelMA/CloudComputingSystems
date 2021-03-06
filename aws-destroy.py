import subprocess
import json
import time
from datetime import datetime
import sys
import os

print("Checking for credentials_config.json file...")
if os.path.exists("credentials_config.json"):
    with open("credentials_config.json", 'r') as f:
        credentials_config = json.load(f)
        secondsPassed = (datetime.now() - datetime.fromtimestamp(credentials_config["timestamp"])).total_seconds()
        if (secondsPassed / 60 / 60) > 2.8:
            print("Credentials will soon expire. Generating new ones.")
            subprocess.run([sys.executable, 'get-credentials.py'])
        else:
            print("Credentials have not expired. Continuing...")
else:
    print("\tThe file does not exist. Skipping credentials check.")

print("Fetching account info...")
accountID = json.loads(subprocess.check_output(
    "aws sts get-caller-identity", shell=True).decode("utf-8"))["Account"]
print("The account id is {}".format(accountID))

print("Deleting dynamodb table...")
subprocess.call("aws dynamodb delete-table --table-name Applicant", shell=True)
subprocess.call("aws dynamodb delete-table --table-name Tests", shell=True)
subprocess.call("aws dynamodb delete-table --table-name TestInstances", shell=True)

lambda_data = [("get-applicant", "lambda.applicant.GetApplicant"), ("get-applicants", "lambda.applicant.GetApplicants"), ("add-applicant", "lambda.applicant.AddApplicant"),
               ("get-all-tests", "lambda.test.GetAllTests"), ("add-test", "lambda.test.AddTest"), ("delete-test", "lambda.test.DeleteTest"), ("update-test", "lambda.test.UpdateTest"), ("get-test", "lambda.test.GetTest"),
               ("solve-test", "lambda.test.SolveTest"), ("add-test-instance", "lambda.test.AddTestInstance"), ("assign-applicant", "lambda.applicant.AssignApplicant"),
               ("get-test-instances-for-user", "lambda.test.GetTestInstancesForUser"), ("get-test-instance", "lambda.test.GetTestInstance"), ("grade-test", "lambda.test.GradeTest"),
               ("delete-test-instance", "lambda.test.DeleteTestInstance"), ("get-unchecked-test-instances", "lambda.test.GetUncheckedTestInstances"), ("translate-test", "lambda.tools.translator.TranslateTest"),
               ("synonym-search", "lambda.tools.synonym.SynonymOfWord")]

lambda_data.append(("upload-photo", ""))
lambda_data.append(("get-photo", ""))

print("Deleting lambdas...")

for lam in lambda_data:
    print("\t"+lam[0])
    subprocess.call(
        "aws lambda delete-function  --function-name {}".format(lam[0]), shell=True)

print("Deleting gateways...")

gatewaysID = json.loads(subprocess.check_output(
    "aws apigateway get-rest-apis", shell=True).decode("utf-8"))["items"]

for gateway in gatewaysID:
    print("\tDeleting {0} with id {1}".format(gateway["name"], gateway["id"]))
    subprocess.call(
        "aws apigateway delete-rest-api --rest-api-id {}".format(gateway["id"]), shell=True)
    time.sleep(5)

print("Clearing S3 buckets...")
# subprocess.call("aws s3 rm s3://applicant-photos --recursive", shell=True)
subprocess.call(
    "aws s3 rm s3://{0}-kotec-lambda-{0} --recursive".format(accountID), shell=True)

# print("Deleting S3 buckets...")
# # subprocess.call("aws s3api delete-bucket --bucket applicant-photos", shell=True)
# subprocess.call(
#     "aws s3api delete-bucket --bucket {0}-kotec-lambda-{0}".format(accountID), shell=True)

print("Deleting Cognito User Pools")
pools = json.loads(subprocess.check_output(
    "aws cognito-idp list-user-pools --max-results 20", shell=True).decode("utf-8"))["UserPools"]
for pool in pools:
    if pool["Name"] == "kotec":
        pool_id = pool["Id"]
        break
subprocess.call(
    "aws cognito-idp delete-user-pool --user-pool-id {}".format(pool_id), shell=True)

print("Deleting Cognito Identity Pools")
id_pools = json.loads(subprocess.check_output(
    "aws cognito-identity list-identity-pools --max-results 20", shell=True).decode('utf-8'))["IdentityPools"]
for pool in id_pools:
    if pool["IdentityPoolName"] == "kotec_id":
        id_pool_id = pool["IdentityPoolId"]
        break
subprocess.call(
    "aws cognito-identity delete-identity-pool --identity-pool-id {}".format(id_pool_id), shell=True)

print("Deleting IAM roles")
arn = "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"

print("\tDetaching IAM policies...")
subprocess.call("aws iam detach-role-policy --role-name Cognito_kotecAuth_Role --policy-arn {}".format(arn), shell=True)


subprocess.call("aws iam delete-role --role-name Cognito_kotecAuth_Role", shell=True)
subprocess.call("aws iam delete-role --role-name Cognito_kotecUnauth_Role", shell=True)

print("Script finished.")
