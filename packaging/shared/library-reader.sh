#!/bin/sh
CONF=/etc/config/qpkg.conf
QPKG_NAME="library-reader"
QPKG_ROOT=`/sbin/getcfg $QPKG_NAME Install_Path -f ${CONF}`
CMD_SETCFG="/sbin/setcfg"

library_start(){
  cd ${QPKG_ROOT}
  LD_LIB="ld-linux-x86-64.so.2"
  ${QPKG_ROOT}/node/lib/$LD_LIB --library-path ${QPKG_ROOT}/node/lib ${QPKG_ROOT}/node/bin/node index.mts site/accessorh/sampleh.mjs &
  sleep 5
}

library_stop(){
  ps aux | grep -ie library-reader/node/lib/ld-linux | grep -v grep | awk '{print $1}' | xargs kill -9
}

case "$1" in
  start)
    ENABLED=$(/sbin/getcfg $QPKG_NAME Enable -u -d FALSE -f $CONF)
    if [ "$ENABLED" != "TRUE" ]; then
        echo "$QPKG_NAME is disabled."
        exit 1
    fi
    library_start
    ;;

  stop)
    library_stop
    ;;

  restart)
    $0 stop
    $0 start
    ;;

  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac

exit 0
