AWS ?= aws
AWS_REGION ?= eu-west-1
AWS_PROFILE ?= default

AWS_CMD := $(AWS) --profile $(AWS_PROFILE) --region $(AWS_REGION)

AWS_ACCOUNT_ID := $(shell $(AWS_CMD) sts get-caller-identity --output text --query 'Account')

node_modules/.bin/webpack:
	npm i

dist/bundle.js: package.json package-lock.json index.js $(wildcard lib/*) node_modules/.bin/webpack
	npm run build

deployment/collector-stack-packaged.yaml: deployment/collector-stack.yaml dist/bundle.js
	$(AWS_CMD) cloudformation package \
		--output-template-file $@ \
		--s3-bucket $(AWS_ACCOUNT_ID)-$(AWS_REGION)-build-resources \
		--s3-prefix hsl-citybike-stats-collector \
		--template-file $<

deploy: deployment/collector-stack-packaged.yaml
	$(AWS_CMD) cloudformation deploy \
		--capabilities CAPABILITY_IAM \
		--stack-name hsl-citybike-stats-collector \
		--tags Deployment=hsl-citybike-stats-collector \
		--template-file $<

.PHONY: clean deploy
clean:
	rm -rf dist/