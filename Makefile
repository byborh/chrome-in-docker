IMAGE_NAME=leboncoin
PROFILE_DIR=src/chrome-profile

build:
	docker build --progress=plain -t ${IMAGE_NAME} .

import-profile: build
	mkdir -p /tmp/${PROFILE_DIR}
	cp -r ${PROFILE_DIR}/* /tmp/${PROFILE_DIR}/ || true
	docker build --progress=plain -t ${IMAGE_NAME} .

run:
	@xhost +local:root
	echo ${DISPLAY}
	docker run -it --rm \
		-e DISPLAY=${DISPLAY} \
		-v /tmp/.X11-unix:/tmp/.X11-unix \
		-v ${PWD}/chrome-profile:/app/leboncoin/src/chrome-profile \
		${IMAGE_NAME}
	@xhost -local:root

clean:
	@docker container stop ${IMAGE_NAME} || true
	@docker container rm ${IMAGE_NAME} || true

default: import-profile run