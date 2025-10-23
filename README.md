Step 1 : create new/.env with DATABASE_URL="your planetscale db"

Step 2 : create old/.env with DATABASE_URL="your planetscale db"

Step 3 : ./run-benchmarks.sh

Step 4 : observe :
~ ~ ~ ~ ~delete-user-cascade~ ~ ~ ~ ~: ~5.5s with old Prisma
~ ~ ~ ~ ~delete-user-cascade~ ~ ~ ~ ~: ~11 s with new generated Prisma
