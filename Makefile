IMAGE_NAME=leboncoin

build:
	docker build --progress=plain -t ${IMAGE_NAME} .

run: build
	@xhost +local:root
	@docker run -it --rm -e DISPLAY=$(DISPLAY) -v /tmp/.X11-unix:/tmp/.X11-unix ${IMAGE_NAME}
	@xhost -local:root

clean:
	@docker container stop ${IMAGE_NAME} || true
	@docker container rm ${IMAGE_NAME} || true