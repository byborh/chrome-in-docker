IMAGE_NAME=leboncoin

build:
	docker build -t ${IMAGE_NAME} .

run: build
	docker run --rm ${IMAGE_NAME}

clean:
	@docker container stop ${IMAGE_NAME} || true
	@docker container rm ${IMAGE_NAME} || true