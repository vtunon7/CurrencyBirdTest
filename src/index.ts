import express from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

interface FetchError {
  message: string;
}

const getToken = async (email: string): Promise<string | FetchError> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      const response = await axios.get(
        `https://prod.developers-test.currencybird.cl/token?email=${email}`
      );
      const token = response.data;
      if (token) {
        await prisma.user.update({
          where: { email: email as string },
          data: { token },
        });
        return token;
      } else {
        return { message: "Error fetching token" };
      }
    } else {
      return { message: "User not found" };
    }
  } catch (error) {
    return { message: "Error fetching token" };
  }
};

const getUser = async (
  email: string
): Promise<typeof prisma.user | FetchError> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { payment: true },
    });
    if (user) {
      return user as unknown as typeof prisma.user;
    } else {
      return { message: "User not found" };
    }
  } catch (error) {
    return { message: "Error fetching user" };
  }
};

app.get("/", (req, res) => {
  res.send("Hello !");
});

app.post("/users", async (req, res) => {
  const { email, name } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.json({ error });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.json({ error });
  }
});

app.post("/token", async (req, res) => {
  try {
    const { email } = req.body;
    const token = await getToken(email);
    // Send the token to the client
    switch ((token as FetchError).message) {
      case "User not found":
        res.json({ message: "User not found" });
        break;
      case "Error fetching token":
        res.json({ message: "Error fetching token" });
        break;
      default:
        res.json({ token });
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }
});

app.get("/user/payment", async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const user = await getUser(email as string);
      if (!("message" in user) && user) {
        const token = await getToken(email as string);
        if (
          (token as FetchError).message !== "Error fetching token" &&
          (token as FetchError).message !== "User not found" &&
          token
        ) {
          const response = await axios.get(
            `https://dev.developers-test.currencybird.cl/payment?email=${email}&transferCode=${email}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
          const payment = response.data;
          if (payment === "TRANSFER_NOT_FOUND") {
            res.json({ message: "No transfers have been made" });
          } else {
            res.json(payment);
          }
        }
      } else {
        res.json({ message: "User not found" });
      }
    } else {
      res.json({ message: "No email provided" });
    }
  } catch (error) {
    console.error("Error fetching payment:", error);
  }
});

app.post("/payment", async (req, res) => {
  try {
    const { email, amount }: { email: string; amount: number } = req.body;
    let user = await prisma.user.findUnique({
      where: { email },
      include: { payment: true },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
        },
        include: { payment: true },
      });
    }
    if (user) {
      if (!user.payment) {
        const token = await getToken(email);
        if ((token as FetchError).message !== "Error fetching token" && token) {
          try {
            const responsePaymentInfo = await axios.get(
              `https://prod.developers-test.currencybird.cl/payment?email=${email}&transferCode=${email}`,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
            );
            if (responsePaymentInfo.data === "TRANSFER_NOT_FOUND") {
              try {
                const response = await axios.post(
                  `https://prod.developers-test.currencybird.cl/payment?email=${email}&transferCode=${email}`,
                  {
                    transferCode: email,
                    amount,
                  },
                  {
                    headers: {
                      Authorization: `${token}`,
                    },
                  }
                );
                const payment = response.data;
                if (payment) {
                  await prisma.payment.create({
                    data: {
                      amount: payment.amount,
                      ip: payment.ip,
                      user: {
                        connect: {
                          email: email as string,
                        },
                      },
                      company: {
                        connect: {
                          name: "GeneralPayment",
                        },
                      },
                    },
                  });
                }
                res.json(payment);
              } catch (error) {
                res.json({ message: "Error, payment already made" });
              }
            } else {
              await prisma.payment.create({
                data: {
                  amount: responsePaymentInfo.data.amount,
                  ip: responsePaymentInfo.data.ip,
                  user: {
                    connect: {
                      email: email as string,
                    },
                  },
                  company: {
                    connect: {
                      name: "GeneralPayment",
                    },
                  },
                },
              });
              res.json({
                message: "Payment was already made, cannot make another one",
                payment: responsePaymentInfo.data,
              });
            }
          } catch (error) {
            res.json({ message: "Error fetching payment" });
          }
        } else {
          res.json({ message: "Error fetching token" });
        }
      } else {
        res.json({
          message: "Payment was already made, cannot make another one",
          payment: user.payment,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching payment:", error);
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
