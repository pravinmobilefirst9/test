pipeline {
    /*
     * Run everything on an existing agent configured with a label 'docker'.
     * This agent will need docker, git and a jdk installed at a minimum.
     */
    agent {
        node {
            label 'docker'
        }
    }

    // Using the Timestamper plugin we can add timestamps to the console log
    options {
        timestamps()
    }

    stages {
        stage ('Initialize') {
            steps {
                sh '''
                    echo "PATH = ${PATH}"
                    echo "BRANCH_NAME = ${BRANCH_NAME}"
                    echo "GIT_BRANCH = ${GIT_BRANCH}"
                    echo "TAG NAME = ${TAG_NAME}"
                '''
            }
        }

        stage('Docker Build and Push Images to registry') {
            steps {
                script {
                    // If HEAD is tagged, then extract version numbers from the tag, otherwise from the branch
                    if (buildingTag()) {
                        // BRANCH_NAME contains tag name when building tag
                        VERSION_STRING = GIT_BRANCH
                        DEFAULT_VERSION_QUALIFIER_SUFFIX = ""
                    } else {
                        VERSION_STRING = GIT_BRANCH
                        // If not a tagged version, then treat everything as a release candidate
                        DEFAULT_VERSION_QUALIFIER_SUFFIX = "-rc"
                    }

                    VERSION_MAJOR = getMajorVersion(VERSION_STRING)
                    VERSION_MINOR = getMinorVersion(VERSION_STRING)
                    VERSION_INCREMENTAL = getIncrementalVersion(VERSION_STRING)
                    VERSION_QUALIFIER = getVersionQualifier(VERSION_STRING)
                    VERSION_INCREMENTAL_SUFFIX = VERSION_INCREMENTAL ? "." + VERSION_INCREMENTAL : ""
                    VERSION_QUALIFIER_SUFFIX = VERSION_QUALIFIER ? "-" + VERSION_QUALIFIER : DEFAULT_VERSION_QUALIFIER_SUFFIX

                    // If we are on a release branch, then push either a release candidate image or a
                    // production image
                    if ((VERSION_MAJOR && VERSION_MINOR) || (GIT_BRANCH == "master")) {
                        if (VERSION_MAJOR && VERSION_MINOR) {
                            DOCKER_IMAGE_VERSION = "${VERSION_MAJOR}.${VERSION_MINOR}${VERSION_INCREMENTAL_SUFFIX}${VERSION_QUALIFIER_SUFFIX}"
                            dockerImage = docker.build("swimbird/sb-swip-app:${DOCKER_IMAGE_VERSION}", "--build-arg buildVersion=${BUILD_NUMBER} --build-arg timestamp=\"${BUILD_TIMESTAMP_PATH}\" .")
                            docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                                dockerImage.push()
                            }
                        } else {
                            DOCKER_IMAGE_VERSION = "latest"
                            dockerImage = docker.build("swimbird/sb-swip-app:${DOCKER_IMAGE_VERSION}", "--build-arg buildVersion=${BUILD_NUMBER} --build-arg timestamp=\"${BUILD_TIMESTAMP_PATH}\" .")
                        }

                        if (GIT_BRANCH == "master") {
                            // Only push image as latest on master branch
                            docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                                dockerImage.push("latest")
                            }
                        }
                    }
                }
            }
        }

        stage('Jira Build Info Notification') {
            steps {
                echo 'Sending build information to Jira'
            }

            post {
                always {
                    jiraSendBuildInfo site: 'swimbird.atlassian.net'
                }
            }
        }
    }
}

@NonCPS
String getMajorVersion(String versionString) {
    def matcher = (versionString =~ /^(?:v?)(?<major>\d+)\.(?<minor>\d+)(?:\.(?<incremental>\d+))?(?:\-(?<qualifier>.+))?$/)
    if (matcher.matches() && matcher.group("major")) {
      matcher.group("major").trim()
    } else {
      null
    }
}

@NonCPS
String getMinorVersion(String versionString) {
    def matcher = (versionString =~ /^(?:v?)(?<major>\d+)\.(?<minor>\d+)(?:\.(?<incremental>\d+))?(?:\-(?<qualifier>.+))?$/)
    if (matcher.matches() && matcher.group("minor")) {
      matcher.group("minor").trim()
    } else {
      null
    }
}

@NonCPS
String getIncrementalVersion(String versionString) {
    def matcher = (versionString =~ /^(?:v?)(?<major>\d+)\.(?<minor>\d+)(?:\.(?<incremental>\d+))?(?:\-(?<qualifier>.+))?$/)
    if (matcher.matches() && matcher.group("incremental")) {
      matcher.group("incremental").trim()
    } else {
      null
    }
}

@NonCPS
String getVersionQualifier(String versionString) {
    def matcher = (versionString =~ /^(?:v?)(?<major>\d+)\.(?<minor>\d+)(?:\.(?<incremental>\d+))?(?:\-(?<qualifier>.+))?$/)
    if (matcher.matches() && matcher.group("qualifier")) {
      matcher.group("qualifier").trim()
    } else {
      null
    }
}
