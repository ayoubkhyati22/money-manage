import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ArrowLeft, Check } from 'lucide-react'

interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

interface MultiStepSignUpFormProps {
  registrationData: RegistrationData
  onRegistrationDataChange: (data: RegistrationData) => void
  showPassword: boolean
  showConfirmPassword: boolean
  loading: boolean
  acceptTerms: boolean
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
  onAcceptTermsChange: (accepted: boolean) => void
  onShowTerms: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function MultiStepSignUpForm({
  registrationData,
  onRegistrationDataChange,
  showPassword,
  showConfirmPassword,
  loading,
  acceptTerms,
  onTogglePassword,
  onToggleConfirmPassword,
  onAcceptTermsChange,
  onShowTerms,
  onSubmit
}: MultiStepSignUpFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Contact', icon: Mail },
    { id: 3, title: 'Security', icon: Lock },
    { id: 4, title: 'Review', icon: Check },
  ]

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return registrationData.firstName.trim().length >= 2 && 
               registrationData.lastName.trim().length >= 2
      case 2:
        return registrationData.email.trim().length > 0 && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)
      case 3:
        return registrationData.password.length >= 6 && 
               registrationData.password === registrationData.confirmPassword
      case 4:
        return acceptTerms
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  const [direction, setDirection] = useState(0)

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg scale-100'
                      : isCurrent
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg scale-110 ring-4 ring-primary-200 dark:ring-primary-800'
                      : 'bg-gray-200 dark:bg-dark-600 text-gray-500 dark:text-dark-400'
                  } ${step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </button>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 relative">
                    <div className="absolute inset-0 bg-gray-200 dark:bg-dark-600 rounded-full"></div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: step.id < currentStep ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between text-xs text-dark-400 dark:text-dark-400 mt-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <span className={`${
                step.id === currentStep 
                  ? 'text-primary-600 dark:text-primary-400 font-semibold' 
                  : step.id < currentStep
                  ? 'text-primary-500 dark:text-primary-500'
                  : ''
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && <div className="flex-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px] relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full"
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-dark-600 dark:text-dark-100 mb-2">
                    Welcome! Let's get to know you
                  </h3>
                  <p className="text-sm text-dark-400 dark:text-dark-300">
                    Tell us your name to personalize your experience
                  </p>
                </div>

                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
                    <input
                      id="firstName"
                      type="text"
                      value={registrationData.firstName}
                      onChange={(e) => onRegistrationDataChange({ ...registrationData, firstName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
                      placeholder="Enter your first name"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
                    <input
                      id="lastName"
                      type="text"
                      value={registrationData.lastName}
                      onChange={(e) => onRegistrationDataChange({ ...registrationData, lastName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-dark-600 dark:text-dark-100 mb-2">
                    How can we reach you?
                  </h3>
                  <p className="text-sm text-dark-400 dark:text-dark-300">
                    We'll use this to keep your account secure
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
                    <input
                      id="email"
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => onRegistrationDataChange({ ...registrationData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
                      placeholder="your.email@example.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={registrationData.phoneNumber}
                      onChange={(e) => onRegistrationDataChange({ ...registrationData, phoneNumber: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Security */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-dark-600 dark:text-dark-100 mb-2">
                    Secure your account
                  </h3>
                  <p className="text-sm text-dark-400 dark:text-dark-300">
                    Create a strong password (at least 6 characters)
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={registrationData.password}
                      onChange={(e) => onRegistrationDataChange({ ...registrationData, password: e.target.value })}
                      className="w-full pl-10 pr-11 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
                      placeholder="Enter your password"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={onTogglePassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-dark-500 dark:text-dark-200 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 dark:text-dark-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registrationData.confirmPassword}
                      onChange={(e) => onRegistrationDataChange({ ...registrationData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-11 py-2.5 border-2 border-mint-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-sm font-medium text-dark-600 dark:text-dark-200"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={onToggleConfirmPassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registrationData.password && registrationData.confirmPassword && registrationData.password !== registrationData.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Passwords don't match
                    </p>
                  )}
                </div>

                {/* Password Strength Indicator */}
                {registrationData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dark-500 dark:text-dark-300">Password Strength:</span>
                      <span className={`font-medium ${
                        registrationData.password.length >= 12 
                          ? 'text-green-600 dark:text-green-400'
                          : registrationData.password.length >= 8
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {registrationData.password.length >= 12 
                          ? 'Strong'
                          : registrationData.password.length >= 8
                          ? 'Medium'
                          : 'Weak'
                        }
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          registrationData.password.length >= 12
                            ? 'bg-green-500'
                            : registrationData.password.length >= 8
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ 
                          width: `${Math.min((registrationData.password.length / 12) * 100, 100)}%` 
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Review & Terms */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-dark-600 dark:text-dark-100 mb-2">
                    Almost there! 🎉
                  </h3>
                  <p className="text-sm text-dark-400 dark:text-dark-300">
                    Review your information and accept our terms
                  </p>
                </div>

                {/* Review Card */}
                <div className="bg-gradient-to-br from-primary-50 to-mint-50 dark:from-primary-900/20 dark:to-mint-900/20 rounded-xl p-4 border border-primary-200 dark:border-dark-600">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-500 dark:text-dark-300">Full Name</span>
                      <span className="text-sm font-semibold text-dark-600 dark:text-dark-100">
                        {registrationData.firstName} {registrationData.lastName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-500 dark:text-dark-300">Email</span>
                      <span className="text-sm font-semibold text-dark-600 dark:text-dark-100">
                        {registrationData.email}
                      </span>
                    </div>
                    {registrationData.phoneNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-500 dark:text-dark-300">Phone</span>
                        <span className="text-sm font-semibold text-dark-600 dark:text-dark-100">
                          {registrationData.phoneNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="flex items-center h-5">
                      <input
                        id="accept-terms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => onAcceptTermsChange(e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-white dark:bg-dark-700 border-2 border-mint-200 dark:border-dark-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 transition-colors"
                        required
                      />
                    </div>
                    <div className="text-xs">
                      <label htmlFor="accept-terms" className="text-dark-500 dark:text-dark-200">
                        I accept the{' '}
                        <button
                          type="button"
                          onClick={onShowTerms}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium transition-colors"
                        >
                          Terms and Conditions
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={onShowTerms}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium transition-colors"
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>
                  </div>
                  {!acceptTerms && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 ml-6">
                      Please accept the terms to continue
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-mint-200 dark:border-dark-600">
        <button
          type="button"
          onClick={() => {
            handlePrevious()
            paginate(-1)
          }}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-dark-500 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => {
              handleNext()
              paginate(1)
            }}
            disabled={!validateStep(currentStep)}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 text-sm"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !acceptTerms || !validateStep(currentStep)}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        )}
      </div>
    </form>
  )
}
