IMAGE_NAME=leboncoin

build:
	@echo "Building..."
	@docker image inspect ${IMAGE_NAME} > /dev/null || docker build --progress=plain -t ${IMAGE_NAME} .

run:
	@echo "Running..."
	@xhost +local:root
	@docker run -it --rm \
		-e DISPLAY=${DISPLAY} \
		-v /tmp/.X11-unix:/tmp/.X11-unix \
		${IMAGE_NAME}
	@xhost -local:root

clean:
	@echo "Cleaning..."
	@docker container stop ${IMAGE_NAME} || true
	@docker container rm ${IMAGE_NAME} || true

default: build run