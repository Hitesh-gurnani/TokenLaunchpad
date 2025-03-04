import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Rocket, Shield, Zap, Sliders } from "lucide-react";
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptAccount,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export function TokenLaunchpad() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    imageUrl: "",
    initialSupply: "",
  });

  const [isHoveringLaunch, setIsHoveringLaunch] = useState(false);

  async function createToken(e) {
    e.preventDefault();

    try {
      if (!wallet.connected || !wallet.publicKey) {
        throw new Error(
          "Wallet not connected. Please connect your wallet first."
        );
      }

      console.log("Creating token...");
      const lamports = await getMinimumBalanceForRentExemptAccount(connection);
      const mintKeypair = Keypair.generate();

      console.log("Mint keypair generated:", mintKeypair.publicKey);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          lamports: lamports,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          mintKeypair.publicKey,
          6, // 6 decimals
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      const recentBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = recentBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;

      transaction.partialSign(mintKeypair);

      console.log("Sending transaction to wallet for approval...");
      const signature = await wallet.sendTransaction(transaction, connection);
      console.log("Transaction sent, signature:", signature);

      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );
      console.log("Transaction confirmed:", confirmation);

      alert(
        `Token created successfully! Mint address: ${mintKeypair.publicKey}`
      );
    } catch (error) {
      console.error("Error creating token:", error);
      alert("Error creating token: " + error.message);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle token launch logic here
    console.log("Launching token with data:", formData);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 text-white font-sans">
      <div className="w-full max-w-5xl px-1 py-12 flex flex-col gap-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              🚀 Solana Token Launchpad
            </span>
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 max-w-6xl mx-auto text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Effortlessly create, customize, and launch your own Solana token
            with our intuitive platform.
          </motion.p>
        </motion.div>

        <div className="flex gap-8 flex-wrap justify-between">
          <motion.div
            className="flex-1 min-w-[380px] bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-gray-800/50"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <h2 className="mb-8 text-cyan-400 text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Token Details
            </h2>

            <form onSubmit={createToken}>
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { name: "name", label: "Name", placeholder: "Token Name" },
                  {
                    name: "symbol",
                    label: "Symbol",
                    placeholder: "Token Symbol",
                  },
                  {
                    name: "imageUrl",
                    label: "Image URL",
                    placeholder: "Token Image URL",
                  },
                  {
                    name: "initialSupply",
                    label: "Initial Supply",
                    placeholder: "Initial Supply",
                  },
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    variants={fadeInUp}
                    className="relative"
                  >
                    <label
                      htmlFor={field.name}
                      className="text-sm text-gray-300 mb-1 block"
                    >
                      {field.label}
                    </label>
                    <input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
                    />
                  </motion.div>
                ))}

                <motion.button
                  type="submit"
                  className="w-full py-4 mt-6 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white rounded-xl text-lg font-bold cursor-pointer shadow-lg shadow-cyan-500/20 hover:shadow-fuchsia-500/30 transition-all duration-300"
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 30px rgba(252, 0, 255, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setIsHoveringLaunch(true)}
                  onHoverEnd={() => setIsHoveringLaunch(false)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Rocket
                      className={`w-5 h-5 transition-transform duration-500 ${
                        isHoveringLaunch ? "translate-x-1 -translate-y-1" : ""
                      }`}
                    />
                    Launch Token
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        <Particles />
      </div>
    </div>
  );
}

function Particles() {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: ["0%", "100%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            y: {
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            opacity: {
              duration: particle.duration / 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }}
        />
      ))}
    </div>
  );
}
