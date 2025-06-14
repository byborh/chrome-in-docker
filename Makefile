IMAGE_NAME=leboncoin
PROFILE_DIR=chrome-profile

build:
	@echo "Building..."
	@docker image inspect ${IMAGE_NAME} > /dev/null || docker build --progress=plain -t ${IMAGE_NAME} .

import-profile: build
	@echo "Importing profile..."
	@mkdir -p /tmp/${PROFILE_DIR}
	@cp -r ${PROFILE_DIR}/* /tmp/${PROFILE_DIR}/ || true

run:
	@echo "Running..."
	@xhost +local:root
	@docker run -it --rm \
		-e DISPLAY=${DISPLAY} \
		-v /tmp/.X11-unix:/tmp/.X11-unix \
		-v ${PWD}/chrome-profile:/app/leboncoin/${PROFILE_DIR} \
		${IMAGE_NAME}
	@xhost -local:root

clean:
	@echo "Cleaning..."
	@docker container stop ${IMAGE_NAME} || true
	@docker container rm ${IMAGE_NAME} || true

default: import-profile run