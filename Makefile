.PHONY: dev install test deploy clean

dev:
	docker-compose up --build

install:
	cd frontend && npm install
	cd backend && dotnet restore
	cd contracts && npm install

test:
	cd backend && dotnet test
	cd contracts && npx hardhat test

deploy-contracts:
	cd contracts && npx hardhat run scripts/deploy.js --network base

deploy-frontend:
	cd frontend && vercel --prod

deploy-backend:
	cd backend && docker build -t flexcard-api . && echo "Deploy to Railway/Fly.io"

clean:
	docker-compose down -v
	cd frontend && rm -rf .next node_modules
	cd backend && rm -rf bin obj
	cd contracts && rm -rf node_modules cache artifacts