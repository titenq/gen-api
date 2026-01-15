import UserModel from "@/models/User.model";

const deleteUsers = async () => {
  try {
    const result = await UserModel.deleteMany({
      name: { $regex: /^FakeUser / },
    });

    console.log(`🗑️ ${result.deletedCount} FakeUsers deleted`);

    process.exit(0);
  } catch (error) {
    console.error("Error deleting users:", error);

    process.exit(1);
  }
};

deleteUsers();
