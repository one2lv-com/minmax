
# One2lvOS Phase 9 Environment
export ONE2LV_ROOT="/opt/one2lv"
export ONE2LV_VERSION="9.0.0"
export DELTA_ENGINE="∆⁹"
export VECTOR_ENGINE="³"

# Phase 9 shortcuts
alias phase9='/opt/one2lv/launch.sh'
alias lumenis='/opt/lumenis/launch-lumenis.sh'
alias delta='cd /opt/one2lv && node'
alias dashboard='xdg-open http://localhost:8080'
alias vectors='cd /opt/one2lv && node -e "console.log(require(\"./modules/system_dynamics.js\"))"'
