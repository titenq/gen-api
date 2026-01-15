import UserModel from "@/models/User.model";

const createUsers = async () => {
  console.log("Creating users, please wait...");

  const users = Array.from({ length: 100 }, (_, i) => ({
    name: `FakeUser ${i + 1}`,
    email: `fakeuser${i + 1}@example.com`,
    password: "Aa12345@",
    isEmailVerified: true,
  }));

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await UserModel.create(user);
        successCount++;
      } catch (_error) {
        errorCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log(`✅ ${successCount} users created successfully`);
    console.log(`❌ ${errorCount} users failed`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating users:", error);

    process.exit(1);
  }
};

createUsers();
