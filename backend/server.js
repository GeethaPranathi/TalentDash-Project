
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MultivariateLinearRegression } = require("ml-regression");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

// Support Vercel Services prefixing
app.use((req, res, next) => {
  if (req.url.startsWith('/_/backend')) {
    req.url = req.url.replace('/_/backend', '');
  } else if (req.url.startsWith('/api')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

const PORT = 5000;


// ==============================
// HOME ROUTE
// ==============================

app.get("/", (req, res) => {

  res.send("API Running Successfully");

});


// ==============================
// REGISTER USER
// ==============================

app.post("/register", async (req, res) => {

  try {

    const { email, password, role } = req.body;

    // CHECK USER EXISTS
    const existingUser =
      await prisma.user.findUnique({
        where: { email }
      });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // CREATE USER
    const user =
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role || "user"
        }
      });

    res.json({
      message: "User registered successfully",
      user
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});


// ==============================
// LOGIN USER
// ==============================

app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // FIND USER
    const user =
      await prisma.user.findUnique({
        where: { email }
      });

    if (!user) {

      return res.status(400).json({
        error: "User not found"
      });

    }

    // CHECK PASSWORD
    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {

      return res.status(400).json({
        error: "Invalid password"
      });

    }

    // GENERATE TOKEN
   const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET || "SECRET_KEY",
  {
    expiresIn: "1d"
  }
);

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});

// ==============================
// USER PROFILE
// ==============================

app.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, profilePic } = req.body;
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, profilePic }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});


// ==============================
// ADD SALARY
// ==============================

app.post("/ingest-salary", async (req, res) => {

  try {

    let {
      company,
      role,
      level_standardized,
      location,
      experience_years,
      base_salary,
      bonus,
      stock,
      confidence
    } = req.body;

    // VALIDATION
    if (!company || !role || !base_salary) {

      return res.status(400).json({
        error: "Missing required fields"
      });

    }

    // DEFAULT VALUES
    bonus = bonus || 0;
    stock = stock || 0;

    // TOTAL COMPENSATION
    const total =
      Number(base_salary) +
      Number(bonus) +
      Number(stock);

    // SAVE TO DATABASE
    const salary =
      await prisma.salary.create({

        data: {

          company,
          role,
          level: level_standardized,
          location,
          experience_years,
          base_salary,
          bonus,
          stock,

          total_compensation: total,

          confidence_score: confidence

        }

      });

    res.json(salary);

    // TRIGGER NOTIFICATION for all admins
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          message: `New salary submission for ${company} (${role})`,
          type: "salary_alert",
          userId: admin.id
        }
      });
    }

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});


// ==============================
// GET ALL SALARIES
// ==============================

app.get("/salaries", async (req, res) => {

  try {

    const salaries =
      await prisma.salary.findMany({

        orderBy: {
          total_compensation: "desc"
        }

      });

    res.json(salaries);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});


// ==============================
// DELETE SALARY
// ==============================

app.delete("/delete-salary/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.salary.delete({ where: { id: Number(id) } });
    res.json({ message: "Salary deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

app.put("/approve-salary/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved, rejected
    const updated = await prisma.salary.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ==============================
// USER MANAGEMENT
// ==============================

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});


// ==============================
// COMPANY DETAILS
// ==============================

app.get("/company/:company", async (req, res) => {

  try {

    const company =
      req.params.company;

    const salaries =
      await prisma.salary.findMany({

        where: {

          company: {
            equals: company,
            mode: "insensitive"
          }

        }

      });

    res.json(salaries);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});


// ==============================
// AI SALARY PREDICTION (ADVANCED)
// ==============================

// Helper to map level to number
const levelMap = {
  "Intern": 1,
  "Entry": 2,
  "Junior": 3,
  "Mid": 4,
  "Senior": 5,
  "Staff": 6,
  "Principal": 7,
  "Director": 8
};

app.post("/predict-salary", async (req, res) => {
  try {
    const { experience, level, company, role } = req.body;

    // 1. Fetch all salaries to train the model
    const salaries = await prisma.salary.findMany();

    if (salaries.length < 5) {
      // Fallback if not enough data
      const predictedSalary = 500000 + Number(experience) * 300000;
      return res.json({ predictedSalary, isFallback: true });
    }

    // 2. Prepare Training Data
    // We'll use experience and level as numeric inputs
    const x = [];
    const y = [];

    salaries.forEach(s => {
      const levelNum = levelMap[s.level] || 3; // default to mid if unknown
      x.push([Number(s.experience_years), levelNum]);
      y.push([Number(s.total_compensation)]);
    });

    // 3. Train Model
    const mlr = new MultivariateLinearRegression(x, y);

    // 4. Predict
    const inputLevelNum = levelMap[level] || 3;
    const prediction = mlr.predict([Number(experience), inputLevelNum]);

    res.json({
      predictedSalary: Math.round(prediction[0]),
      isFallback: false
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});


// ==============================
// GET PREDICTION BY PARAM
// ==============================

app.get("/predict/:experience", (req, res) => {

  try {

    const exp =
      Number(req.params.experience);

    const prediction =
      500000 + exp * 300000;

    res.json({
      predicted_salary: prediction
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Prediction failed"
    });

  }

});


// ==============================
// START SERVER
// ==============================

// ==============================
// JOBS MODULE
// ==============================

app.post("/jobs", async (req, res) => {
  try {
    const { title, company, location, description, salary, postedById } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        description,
        salary,
        postedById: Number(postedById)
      }
    });

    res.json(job);

    // TRIGGER NOTIFICATION for the recruiter (confirmation)
    await prisma.notification.create({
      data: {
        message: `Your job listing for ${title} at ${company} is now live!`,
        type: "job_alert",
        userId: Number(postedById)
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to post job" });
  }
});

app.get("/jobs", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { postedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ==============================
// NOTIFICATIONS
// ==============================

app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.put("/notifications/read/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id: Number(id) },
      data: { read: true }
    });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

app.delete("/notifications/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await prisma.notification.deleteMany({
      where: { userId: Number(userId) }
    });
    res.json({ message: "Notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;