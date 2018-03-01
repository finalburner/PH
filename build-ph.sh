fileres="version-info.res"
file="version-info.rc"
if [ -f "$file" ]
then
  pkg -t latest-win-x64 ph.js -d -c package.json -o ph.exe
  C:/ResourceHacker/ResourceHacker.exe -open version-info.rc -action compile -save version-info.res
  C:/ResourceHacker/ResourceHacker.exe -open ph.exe -resource version-info.res -action add -save ph.exe
  rm $file
  rm $fileres

else
	echo "$file not found."
fi
