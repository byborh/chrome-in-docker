IMAGE_NAME := leboncoin
TOR_VOLUME := tor-data

.PHONY: build run logs clean prune-volumes

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run --rm \
		--name $(IMAGE_NAME) \
		$(IMAGE_NAME)

logs:
	docker logs -f $(IMAGE_NAME)

clean:
	docker rm -f $(IMAGE_NAME) || true

prune-volumes:
	docker volume prune -f

