pipeline {
    agent any
    environment {
        NODE_VERSION = '18'
    }
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Set Up Node.js') {
            steps {
                sh """
                    source ~/.nvm/nvm.sh
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}
                    node -v
                """
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Install CocoaPods') {
            steps {
                sh 'sudo gem install cocoapods'
            }
        }

        stage('Install iOS Pods') {
            steps {
                sh '''
          cd ios
          pod install
          cd ..
        '''
            }
        }

        stage('Lint Code') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build Android') {
            steps {
                sh 'npm run build-android'
            }
        }

        stage('Build iOS') {
            steps {
                sh 'npm run build-ios'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        failure {
            echo 'Pipeline failed.'
        }
        success {
            echo 'Pipeline succeeded.'
        }
    }
}
