import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Target,
  PiggyBank,
  BarChart3,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export function LandingPage() {
  const navigate = useNavigate()
  const { darkMode } = useDarkMode()

  const features = [
    {
      icon: <PiggyBank className="w-8 h-8" />,
      title: 'Smart Banking',
      description: 'Manage multiple bank accounts and track balances in real-time with intuitive visualizations.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Stock Portfolio',
      description: 'Track your stock investments, monitor gains/losses, and make informed decisions.'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Financial Goals',
      description: 'Set objectives and allocate funds strategically to achieve your financial targets.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'DCA Plans',
      description: 'Implement Dollar Cost Averaging strategies with automated tracking and performance analytics.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure with industry-standard protection.'
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile Ready',
      description: 'Access your finances anywhere with our responsive design and mobile support.'
    }
  ]

  const benefits = [
    'Track all transactions in one place',
    'Visualize spending patterns with graphs',
    'Monitor investment performance',
    'Set and achieve financial goals',
    'Export data for analysis',
    'Dark mode support'
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 min-h-screen">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <PiggyBank className="w-8 h-8 text-emerald-600 dark:text-primary-400" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                MoneyManager
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 text-emerald-600 dark:text-primary-400 hover:bg-emerald-50 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-emerald-600 dark:bg-primary-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Take Control of Your
                <span className="text-emerald-600 dark:text-primary-400"> Financial Future</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                A comprehensive money management platform to track expenses, manage investments,
                and achieve your financial goals with intelligent insights.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 bg-emerald-600 dark:bg-primary-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 text-lg"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 border-2 border-emerald-600 dark:border-primary-400 text-emerald-600 dark:text-primary-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-dark-700 transition-colors text-lg"
                >
                  Learn More
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-dark-700">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-primary-900/20 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Total Balance</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-primary-400">$24,580.00</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Income</div>
                      <div className="text-xl font-semibold text-green-600 dark:text-green-400">+$5,240</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expenses</div>
                      <div className="text-xl font-semibold text-red-600 dark:text-red-400">-$2,180</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 rounded-lg flex items-end justify-around p-4">
                    {[60, 80, 65, 90, 75, 85].map((height, i) => (
                      <div
                        key={i}
                        className="bg-emerald-600 dark:bg-primary-500 rounded-t"
                        style={{ width: '12%', height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed to simplify your financial life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-dark-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-dark-700"
              >
                <div className="text-emerald-600 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-12 border border-gray-200 dark:border-dark-700">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Why Choose MoneyManager?
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-primary-400 flex-shrink-0" />
                      <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-blue-600 dark:from-primary-600 dark:to-blue-700 rounded-xl p-8 text-white">
                  <div className="text-5xl font-bold mb-2">100%</div>
                  <div className="text-xl mb-6">Free to Use</div>
                  <div className="space-y-2 text-emerald-50 dark:text-primary-100">
                    <p>No hidden fees</p>
                    <p>No credit card required</p>
                    <p>Unlimited transactions</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-primary-600 dark:to-blue-700 rounded-2xl p-12 text-center text-white shadow-2xl"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-xl mb-8 text-emerald-50 dark:text-primary-100">
              Join thousands of users who are already managing their finances smarter
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-10 py-4 bg-white text-emerald-600 dark:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl text-lg font-semibold flex items-center gap-2 mx-auto"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-gray-200 dark:border-dark-700">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 MoneyManager. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
