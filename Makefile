IMAGE_NAME=leboncoin

build:
	@echo "🔧 Building Docker image..."
	@docker build --progress=plain -t ${IMAGE_NAME} .

run:
	@echo "🚀 Running container with volumes..."
	@docker run -it --rm \
		-v $(CURDIR)/src:/app/leboncoin/src \
		-v $(CURDIR)/chrome-profile:/app/chrome-profile \
		--name ${IMAGE_NAME} \
		${IMAGE_NAME}

clean:
	@echo "🧹 Cleaning Docker containers..."
	@docker container stop ${IMAGE_NAME} || true
	@docker container rm ${IMAGE_NAME} || true

rebuild: clean build

dev: build run

delete-files:
	rm ./src/index.html || true
	rm ./src/error.log || true
	rm ./src/error_page.html || true
	rm ./src/data.json || true
