aws cloudformation create-stack \
--stack-name slsblog-database \
--template-body "file://./cloudformation.yml" \
--parameters ParameterKey=ResourceName,ParameterValue=$1