import formatDate from '@/utils/formatDate'

const lastYearDate = formatDate('last-year')
const currentDate = formatDate('last-day')
const packageNameHasSlash = packageName => /\//.test(packageName)
const getFetchPromise = packages => fetch(`https://api.npmjs.org/downloads/range/${lastYearDate}:${currentDate}/${packages}`)
const find = (str, s) => str.indexOf(s) !== -1

export default async function queryData (packages) {
  // a,b,c || @angular/core
  if (!find(packages, '/') || !find(packages, ',')) {
    const response = await getFetchPromise(packages)
    const data = await response.json()
    return data
  }
  // example: @angular/core,a,b
  const slashPackageList = []
  const normalPackageList = []
  const packageList = packages.split(',')
  packageList.forEach(packageName => {
    if (packageNameHasSlash(packageName)) {
      slashPackageList.push(packageName)
    } else {
      normalPackageList.push(packageName)
    }
  })
  const hasNormalPackage = normalPackageList.length
  const responseList = await Promise.all([hasNormalPackage ? getFetchPromise(normalPackageList.join(',')) : null].concat(slashPackageList.map(getFetchPromise)))
  // 数据适配
  const [normalPackageData, ...slashPackageData] = await Promise.all(responseList.map(res => res.json()))
  let data = {}
  if (normalPackageList.length >= 2) {
    slashPackageList.forEach((slashPackageName, i) => {
      normalPackageData[slashPackageName] = slashPackageData[i]
    })
    data = normalPackageData
  } else {
    if (hasNormalPackage) { // 只有一个
      data[normalPackageList[0]] = normalPackageData
    }
    slashPackageList.forEach((slashPackageName, i) => {
      data[slashPackageName] = slashPackageData[i]
    })
  }
  return data
}
